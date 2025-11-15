const MealPlan = require('../Models/MealPlan');
const Ingredient = require('../Models/Ingredient');
const Recipe = require('../Models/Recipe');
const User = require('../Models/User');

// @desc    Get meal plans for user
// @route   GET /api/mealplans
// @access  Private
exports.getMealPlans = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const mealPlans = await MealPlan.find(query)
      .populate('meals.items.foodId', 'name nutrition')
      .populate('meals.items.recipeId', 'name nutrition instructions mainIngredient otherIngredients')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      data: mealPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meal plans',
      error: error.message,
    });
  }
};

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate('meals.items.foodId', 'name nutrition servingSize image')
      .populate('meals.items.recipeId', 'name nutrition instructions mainIngredient otherIngredients');

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meal plan',
      error: error.message,
    });
  }
};

// @desc    Generate meal plan for a date using recipes
// @route   POST /api/mealplans/generate
// @access  Private
exports.generateMealPlan = async (req, res) => {
  try {
    const { date, nutritionGoals } = req.body;
    
    console.log('Generate meal plan request:', { date, nutritionGoals });
    
    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure healthProfile exists and is an object
    if (!user.healthProfile || typeof user.healthProfile !== 'object') {
      user.healthProfile = {};
      await user.save();
    }
    
    console.log('User health profile:', user.healthProfile);

    // Use nutrition goals from request body (from daily tracker) if provided
    // Otherwise fall back to calculating from user profile or use defaults
    let targetCalories, targetProtein, targetCarbs, targetFat;

    if (nutritionGoals && typeof nutritionGoals === 'object' && nutritionGoals.calories) {
      // Use goals from daily tracker
      targetCalories = parseFloat(nutritionGoals.calories) || 2000;
      targetProtein = parseFloat(nutritionGoals.protein) || Math.round((targetCalories * 0.25) / 4);
      targetCarbs = parseFloat(nutritionGoals.carbs) || Math.round((targetCalories * 0.45) / 4);
      targetFat = parseFloat(nutritionGoals.fat) || Math.round((targetCalories * 0.30) / 9);
    } else {
      // Fall back to user profile or use defaults
      if (user.healthProfile && user.healthProfile.dailyCalorieGoal) {
        const weight = user.healthProfile.weight || 70; // Default weight in kg
        targetCalories = user.healthProfile.dailyCalorieGoal;
        
        // Calculate macronutrient goals
        // Protein: 0.8-1g per kg body weight (use 1g for active users)
        targetProtein = Math.round(weight * 1.0);
        // Carbs: 45-55% of calories (4 calories per gram)
        targetCarbs = Math.round((targetCalories * 0.50) / 4);
        // Fat: 25-30% of calories (9 calories per gram)
        targetFat = Math.round((targetCalories * 0.27) / 9);
      } else {
        // Use default goals if nothing is set
        targetCalories = 2000;
        targetProtein = 125;
        targetCarbs = 225;
        targetFat = 67;
      }
    }

    const calculatedGoals = {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
    };

    // Define acceptable range (75%-110%)
    const minNutrition = {
      calories: Math.round(targetCalories * 0.75),
      protein: Math.round(targetProtein * 0.75),
      carbs: Math.round(targetCarbs * 0.75),
      fat: Math.round(targetFat * 0.75),
    };

    const maxNutrition = {
      calories: Math.round(targetCalories * 1.10),
      protein: Math.round(targetProtein * 1.10),
      carbs: Math.round(targetCarbs * 1.10),
      fat: Math.round(targetFat * 1.10),
    };

    // Calorie distribution for 3 meals (no snack)
    const calorieDistribution = {
      breakfast: 0.30, // 30%
      lunch: 0.40,     // 40%
      dinner: 0.30,    // 30%
    };

    // Build recipe query based on user's health conditions and dietary preferences
    // Make it lenient - prefer matching recipes but fall back to all recipes if needed
    let recipeQuery = {};
    const andConditions = [];

    // Ensure healthProfile exists
    if (!user.healthProfile) {
      user.healthProfile = {};
    }

    // Filter based on health conditions (prefer matching, but allow all if none match)
    if (user.healthProfile.healthConditions && Array.isArray(user.healthProfile.healthConditions)) {
      if (user.healthProfile.healthConditions.includes('diabetes')) {
        andConditions.push({
          $or: [
            { tags: { $in: ['diabetes-friendly'] } },
            { tags: { $exists: false } },
            { tags: { $size: 0 } },
          ]
        });
      }
      if (user.healthProfile.healthConditions.includes('heart_disease')) {
        andConditions.push({
          $or: [
            { tags: { $in: ['heart-healthy'] } },
            { tags: { $exists: false } },
            { tags: { $size: 0 } },
          ]
        });
      }
    }

    // Filter based on dietary preferences (optional - don't restrict if no match)
    if (user.dietaryPreferences && Array.isArray(user.dietaryPreferences) && user.dietaryPreferences.length > 0) {
      recipeQuery.dietaryType = { $in: user.dietaryPreferences };
    }

    if (andConditions.length > 0) {
      recipeQuery.$and = andConditions;
    }

    // Get all available recipes (try filtered first, then all if none found)
    console.log('Recipe query:', JSON.stringify(recipeQuery));
    let availableRecipes = await Recipe.find(recipeQuery).limit(100);
    console.log(`Found ${availableRecipes.length} recipes with filters`);

    // If no recipes match the filters, use all recipes (lenient approach)
    if (availableRecipes.length === 0) {
      console.log('No recipes matched filters, using all available recipes');
      availableRecipes = await Recipe.find({}).limit(100);
      console.log(`Found ${availableRecipes.length} total recipes`);
    }

    // If still no recipes, return error
    if (availableRecipes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipes available in the database. Please contact administrator.',
      });
    }
    
    // Log recipe sample for debugging
    if (availableRecipes.length > 0) {
      console.log('Sample recipe:', {
        name: availableRecipes[0].name,
        calories: availableRecipes[0].nutrition?.calories,
        proteins: availableRecipes[0].nutrition?.proteins,
        carbohydrates: availableRecipes[0].nutrition?.carbohydrates,
      });
    }

    // Generate meals using recipes
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const meals = [];
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Try multiple times to find a valid combination
    let attempts = 0;
    const maxAttempts = 50;
    let validPlan = false;

    while (!validPlan && attempts < maxAttempts) {
      meals.length = 0;
      totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const usedRecipeIds = new Set();

      for (const mealType of mealTypes) {
        const mealCalories = targetCalories * calorieDistribution[mealType];
        const mealProtein = targetProtein * calorieDistribution[mealType];
        const mealCarbs = targetCarbs * calorieDistribution[mealType];
        const mealFat = targetFat * calorieDistribution[mealType];

        // Select recipes for this meal type
        const mealRecipes = selectRecipesForMeal(
          availableRecipes,
          mealType,
          mealCalories,
          mealProtein,
          mealCarbs,
          mealFat,
          usedRecipeIds
        );

        if (mealRecipes.length === 0) {
          console.log(`No recipes found for ${mealType}, attempt ${attempts + 1}`);
          // On last attempt, try to get any recipe for this meal type
          if (attempts === maxAttempts - 1) {
            const anyRecipe = availableRecipes.find(r => !usedRecipeIds.has(r._id.toString()));
            if (anyRecipe) {
              const recipeCalories = anyRecipe.nutrition?.calories || 0;
              const recipeProtein = anyRecipe.nutrition?.proteins || 0;
              const recipeCarbs = anyRecipe.nutrition?.carbohydrates || 0;
              const recipeFat = anyRecipe.nutrition?.fat || 0;
              
              mealRecipes.push({
                recipeId: anyRecipe._id,
                foodName: anyRecipe.name,
                quantity: 1,
                nutrition: {
                  calories: recipeCalories,
                  protein: recipeProtein,
                  carbs: recipeCarbs,
                  fat: recipeFat,
                },
                recipeName: anyRecipe.name,
                recipeInstructions: anyRecipe.instructions,
                recipeIngredients: [anyRecipe.mainIngredient, ...(anyRecipe.otherIngredients || [])],
              });
              usedRecipeIds.add(anyRecipe._id.toString());
            }
          }
          
          if (mealRecipes.length === 0) {
            break; // No valid recipes found for this meal
          }
        }

        // Calculate meal nutrition (handle missing nutrition fields)
        const mealNutrition = mealRecipes.reduce((acc, item) => ({
          calories: acc.calories + ((item.nutrition?.calories || 0) * (item.quantity || 1)),
          protein: acc.protein + ((item.nutrition?.protein || 0) * (item.quantity || 1)),
          carbs: acc.carbs + ((item.nutrition?.carbs || 0) * (item.quantity || 1)),
          fat: acc.fat + ((item.nutrition?.fat || 0) * (item.quantity || 1)),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        meals.push({
          mealType,
          items: mealRecipes,
          totalNutrition: mealNutrition,
        });

        // Update total nutrition
        totalNutrition.calories += mealNutrition.calories;
        totalNutrition.protein += mealNutrition.protein;
        totalNutrition.carbs += mealNutrition.carbs;
        totalNutrition.fat += mealNutrition.fat;
      }

      // Check if plan meets criteria (75%-110% range for calories, more lenient for macros)
      // Be more lenient with macros - allow 60%-120% range
      const macroMin = 0.60;
      const macroMax = 1.20;
      
      if (
        meals.length === 3 &&
        totalNutrition.calories >= minNutrition.calories &&
        totalNutrition.calories <= maxNutrition.calories &&
        totalNutrition.protein >= (targetProtein * macroMin) &&
        totalNutrition.protein <= (targetProtein * macroMax) &&
        totalNutrition.carbs >= (targetCarbs * macroMin) &&
        totalNutrition.carbs <= (targetCarbs * macroMax) &&
        totalNutrition.fat >= (targetFat * macroMin) &&
        totalNutrition.fat <= (targetFat * macroMax)
      ) {
        validPlan = true;
      } else {
        attempts++;
      }
    }

    // If still no valid plan after attempts, create one anyway with what we have (better than nothing)
    if (!validPlan && meals.length === 3) {
      console.log('Could not find perfect match, using best available plan');
      validPlan = true; // Accept the plan even if not perfect
    }

    if (!validPlan || meals.length < 3) {
      console.error('Failed to generate meal plan:', {
        mealsGenerated: meals.length,
        availableRecipes: availableRecipes.length,
        attempts: attempts,
        totalNutrition,
        targetCalories,
      });
      
      // If we have at least 2 meals, try to create a plan anyway
      if (meals.length >= 2) {
        console.log('Creating plan with partial meals');
        validPlan = true;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unable to generate a complete meal plan. Please ensure there are enough recipes in the database or try adjusting your nutrition goals.',
          debug: {
            mealsGenerated: meals.length,
            availableRecipes: availableRecipes.length,
            attempts: attempts,
          }
        });
      }
    }

    // Save or update meal plan
    // Normalize date to start of day for consistent lookup
    const planDate = new Date(date);
    planDate.setHours(0, 0, 0, 0);
    
    let mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      date: {
        $gte: planDate,
        $lt: new Date(planDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (mealPlan) {
      mealPlan.meals = meals;
      mealPlan.totalNutrition = totalNutrition;
      await mealPlan.save();
    } else {
      mealPlan = await MealPlan.create({
        userId: req.user.id,
        date: planDate,
        meals,
        totalNutrition,
      });
    }
    
    console.log('Meal plan saved successfully:', mealPlan._id);

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('meals.items.recipeId', 'name nutrition instructions mainIngredient otherIngredients');

    res.status(200).json({
      success: true,
      data: populatedMealPlan,
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating meal plan',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Send meal plan via email
// @route   POST /api/mealplans/:id/email
// @access  Private
exports.sendMealPlanEmail = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('meals.items.recipeId', 'name nutrition instructions mainIngredient otherIngredients');

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    const user = await User.findById(req.user.id);
    const { sendMealPlanEmail } = require('../Utils/emailService');

    await sendMealPlanEmail(user, mealPlan, mealPlan.date);

    res.status(200).json({
      success: true,
      message: 'Meal plan sent to your email successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending meal plan email',
      error: error.message,
    });
  }
};

// @desc    Create or update meal plan
// @route   POST /api/mealplans
// @access  Private
exports.createMealPlan = async (req, res) => {
  try {
    const { date, meals, notes } = req.body;

    // Calculate total nutrition
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    for (const meal of meals) {
      for (const item of meal.items) {
        const ingredient = await Ingredient.findById(item.foodId);
        if (ingredient) {
          const quantity = item.quantity || 1;
          totalNutrition.calories += ingredient.nutrition.calories * quantity;
          totalNutrition.protein += ingredient.nutrition.proteins * quantity;
          totalNutrition.carbs += ingredient.nutrition.carbohydrates * quantity;
          totalNutrition.fat += ingredient.nutrition.fat * quantity;
        }
      }
    }

    let mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      date: new Date(date),
    });

    if (mealPlan) {
      mealPlan.meals = meals;
      mealPlan.totalNutrition = totalNutrition;
      mealPlan.notes = notes || mealPlan.notes;
      await mealPlan.save();
    } else {
      mealPlan = await MealPlan.create({
        userId: req.user.id,
        date: new Date(date),
        meals,
        totalNutrition,
        notes,
      });
    }

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('meals.items.foodId', 'name nutrition');

    res.status(200).json({
      success: true,
      data: populatedMealPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating meal plan',
      error: error.message,
    });
  }
};

// Helper function to select recipes for a meal
function selectRecipesForMeal(recipes, mealType, targetCalories, targetProtein, targetCarbs, targetFat, usedRecipeIds) {
  const mealItems = [];
  let currentNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  // Filter recipes appropriate for meal type
  let appropriateRecipes = recipes.filter(recipe => {
    // Skip already used recipes
    if (usedRecipeIds.has(recipe._id.toString())) {
      return false;
    }

    // Filter by meal type tags or name patterns
    if (mealType === 'breakfast') {
      const breakfastKeywords = ['breakfast', 'morning', 'hoppers', 'string hoppers', 'roti', 'kiribath'];
      const recipeName = recipe.name.toLowerCase();
      const hasBreakfastTag = recipe.tags?.some(tag => 
        breakfastKeywords.some(keyword => tag.toLowerCase().includes(keyword))
      );
      return hasBreakfastTag || breakfastKeywords.some(keyword => recipeName.includes(keyword));
    } else if (mealType === 'lunch') {
      const lunchKeywords = ['rice', 'curry', 'dhal', 'lunch'];
      const recipeName = recipe.name.toLowerCase();
      const hasLunchTag = recipe.tags?.some(tag => 
        lunchKeywords.some(keyword => tag.toLowerCase().includes(keyword))
      );
      return hasLunchTag || lunchKeywords.some(keyword => recipeName.includes(keyword));
    } else if (mealType === 'dinner') {
      // Dinner can be similar to lunch, but avoid breakfast items
      const breakfastKeywords = ['breakfast', 'morning', 'hoppers'];
      const recipeName = recipe.name.toLowerCase();
      const isBreakfast = breakfastKeywords.some(keyword => recipeName.includes(keyword));
      return !isBreakfast;
    }
    return true;
  });

  // If no specific recipes found, use all available recipes
  if (appropriateRecipes.length === 0) {
    appropriateRecipes = recipes.filter(recipe => !usedRecipeIds.has(recipe._id.toString()));
  }

  // Shuffle recipes for variety
  const shuffled = [...appropriateRecipes].sort(() => Math.random() - 0.5);

  // Try to select 1-3 recipes that fit the meal requirements
  for (const recipe of shuffled) {
    if (mealItems.length >= 3) break; // Limit to 3 recipes per meal

    const recipeCalories = recipe.nutrition?.calories || 0;
    const recipeProtein = recipe.nutrition?.proteins || recipe.nutrition?.protein || 0;
    const recipeCarbs = recipe.nutrition?.carbohydrates || recipe.nutrition?.carbs || 0;
    const recipeFat = recipe.nutrition?.fat || 0;
    
    // Skip recipes with no calories
    if (recipeCalories === 0) {
      continue;
    }

    // Calculate how many servings we can add
    const remainingCalories = targetCalories - currentNutrition.calories;
    const remainingProtein = targetProtein - currentNutrition.protein;
    const remainingCarbs = targetCarbs - currentNutrition.carbs;
    const remainingFat = targetFat - currentNutrition.fat;

    // Check if recipe fits (more lenient - allow recipes that are reasonable for the meal)
    // Allow recipes that are between 20% and 200% of remaining calories (more flexible)
    const fitsCalorieRange = remainingCalories > 0 
      ? (recipeCalories <= remainingCalories * 2.0 && recipeCalories >= remainingCalories * 0.2)
      : recipeCalories <= targetCalories * 0.5; // If we've exceeded, allow smaller recipes
    
    if (fitsCalorieRange || mealItems.length === 0) { // Always add at least one recipe
      const quantity = 1; // Start with 1 serving
      
      const newNutrition = {
        calories: currentNutrition.calories + (recipeCalories * quantity),
        protein: currentNutrition.protein + (recipeProtein * quantity),
        carbs: currentNutrition.carbs + (recipeCarbs * quantity),
        fat: currentNutrition.fat + (recipeFat * quantity),
      };

      // Check if adding this recipe keeps us within reasonable bounds (more lenient)
      if (
        newNutrition.calories <= targetCalories * 1.5 && // Allow up to 150% for flexibility
        (mealItems.length === 0 || newNutrition.calories <= targetCalories * 1.3) // First recipe can be larger
      ) {
        mealItems.push({
          recipeId: recipe._id,
          foodName: recipe.name,
          quantity: quantity,
          nutrition: {
            calories: recipeCalories,
            protein: recipeProtein,
            carbs: recipeCarbs,
            fat: recipeFat,
          },
          recipeName: recipe.name,
          recipeInstructions: recipe.instructions,
          recipeIngredients: [recipe.mainIngredient, ...(recipe.otherIngredients || [])],
        });

        currentNutrition = newNutrition;
        usedRecipeIds.add(recipe._id.toString());

        // If we've reached 80% of target, we're good
        if (currentNutrition.calories >= targetCalories * 0.80) {
          break;
        }
      }
    }
  }

  return mealItems;
}

