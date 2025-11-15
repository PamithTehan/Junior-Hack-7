const DailyIntake = require('../Models/DailyIntake');
const Ingredient = require('../Models/Ingredient');
const Recipe = require('../Models/Recipe');
const User = require('../Models/User');

// @desc    Get daily intake records
// @route   GET /api/tracking
// @access  Private
exports.getDailyIntakes = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const intakes = await DailyIntake.find(query)
      .populate('foods.foodId', 'name nutrition')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: intakes.length,
      data: intakes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily intakes',
      error: error.message,
    });
  }
};

// @desc    Get single daily intake
// @route   GET /api/tracking/:date
// @access  Private
exports.getDailyIntake = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    let intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate('foods.foodId', 'name nutrition');

    if (!intake) {
      // Create empty intake if none exists
      intake = await DailyIntake.create({
        userId: req.user.id,
        date: date,
        foods: [],
        totalCalories: 0,
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      });
    }

    res.status(200).json({
      success: true,
      data: intake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily intake',
      error: error.message,
    });
  }
};

// @desc    Add food to daily intake
// @route   POST /api/tracking
// @access  Private
exports.addFood = async (req, res) => {
  try {
    const { foodId, quantity, mealType, date } = req.body;

    if (!foodId || !quantity || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide foodId, quantity, and mealType',
      });
    }

    const ingredient = await Ingredient.findById(foodId);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found',
      });
    }

    const intakeDate = date ? new Date(date) : new Date();
    intakeDate.setHours(0, 0, 0, 0);

    let intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: intakeDate,
        $lt: new Date(intakeDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!intake) {
      intake = await DailyIntake.create({
        userId: req.user.id,
        date: intakeDate,
        foods: [],
        totalCalories: 0,
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
    }

    // Calculate nutrition for this ingredient (per 100g, quantity is multiplier)
    const nutrition = {
      calories: ingredient.nutrition.calories * quantity,
      protein: ingredient.nutrition.proteins * quantity,
      carbs: ingredient.nutrition.carbohydrates * quantity,
      fat: ingredient.nutrition.fat * quantity,
      fiber: (ingredient.nutrition.fiber || 0) * quantity,
    };

    // Add ingredient to intake
    intake.foods.push({
      foodId: ingredient._id,
      foodName: ingredient.name,
      quantity,
      mealType,
      nutrition,
      loggedAt: new Date(),
    });

    // Update total nutrition
    intake.totalNutrition.calories += nutrition.calories;
    intake.totalNutrition.protein += nutrition.protein;
    intake.totalNutrition.carbs += nutrition.carbs;
    intake.totalNutrition.fat += nutrition.fat;
    if (intake.totalNutrition.fiber === undefined) {
      intake.totalNutrition.fiber = 0;
    }
    intake.totalNutrition.fiber += nutrition.fiber;
    intake.totalCalories = intake.totalNutrition.calories;

    await intake.save();

    const populatedIntake = await DailyIntake.findById(intake._id)
      .populate('foods.foodId', 'name nutrition');

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('food:added', {
        intake: populatedIntake,
        food: populatedIntake.foods[populatedIntake.foods.length - 1],
      });
    }

    res.status(200).json({
      success: true,
      data: populatedIntake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding food to intake',
      error: error.message,
    });
  }
};

// @desc    Add scanned food to daily intake (with direct nutrition data)
// @route   POST /api/tracking/scan
// @access  Private
exports.addScannedFood = async (req, res) => {
  try {
    const { foodName, nutrition, quantity, mealType, date } = req.body;

    if (!foodName || !nutrition || !quantity || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide foodName, nutrition, quantity, and mealType',
      });
    }

    const intakeDate = date ? new Date(date) : new Date();
    intakeDate.setHours(0, 0, 0, 0);

    let intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: intakeDate,
        $lt: new Date(intakeDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!intake) {
      intake = await DailyIntake.create({
        userId: req.user.id,
        date: intakeDate,
        foods: [],
        totalCalories: 0,
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
    }

    // Calculate nutrition for this food (only include: calories, carbs, protein, fiber, fat)
    // Exclude sugar and sodium from scanned foods
    const calculatedNutrition = {
      calories: (nutrition.calories || 0) * quantity,
      protein: (nutrition.protein || 0) * quantity,
      carbs: (nutrition.carbs || nutrition.carbohydrates || 0) * quantity,
      fat: (nutrition.fat || 0) * quantity,
      fiber: (nutrition.fiber || 0) * quantity,
      // Explicitly exclude sugar and sodium
      sugar: 0,
      sodium: 0,
    };

    // Add food to intake
    intake.foods.push({
      foodId: null, // No foodId for scanned foods
      foodName: foodName,
      quantity,
      mealType,
      nutrition: calculatedNutrition,
      loggedAt: new Date(),
    });

    // Update total nutrition
    intake.totalNutrition.calories += calculatedNutrition.calories;
    intake.totalNutrition.protein += calculatedNutrition.protein;
    intake.totalNutrition.carbs += calculatedNutrition.carbs;
    intake.totalNutrition.fat += calculatedNutrition.fat;
    if (intake.totalNutrition.fiber === undefined) {
      intake.totalNutrition.fiber = 0;
    }
    intake.totalNutrition.fiber += calculatedNutrition.fiber;
    intake.totalCalories = intake.totalNutrition.calories;

    await intake.save();

    const populatedIntake = await DailyIntake.findById(intake._id);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('food:added', {
        intake: populatedIntake,
        food: populatedIntake.foods[populatedIntake.foods.length - 1],
      });
    }

    res.status(200).json({
      success: true,
      data: populatedIntake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding scanned food to intake',
      error: error.message,
    });
  }
};

// @desc    Remove food from daily intake
// @route   DELETE /api/tracking/food?intakeId=xxx&foodItemId=xxx
// @access  Private
exports.removeFood = async (req, res) => {
  try {
    const { intakeId, foodItemId } = req.query;
    
    if (!intakeId || !foodItemId) {
      return res.status(400).json({
        success: false,
        message: 'intakeId and foodItemId are required as query parameters',
      });
    }
    
    console.log('DELETE request received:', { intakeId, foodItemId, userId: req.user.id });

    const intake = await DailyIntake.findOne({
      _id: intakeId,
      userId: req.user.id,
    });

    if (!intake) {
      console.log('Intake not found:', { intakeId, userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: 'Daily intake not found',
        debug: { intakeId, userId: req.user.id },
      });
    }
    
    console.log('Intake found:', { 
      intakeId: intake._id, 
      foodsCount: intake.foods.length,
      foodIds: intake.foods.map(f => String(f._id)),
      searchingFor: foodItemId
    });

    // Try multiple methods to find the food item
    let foodItem = null;
    
    // Method 1: Try Mongoose's id() method
    try {
      foodItem = intake.foods.id(foodItemId);
    } catch (e) {
      console.log('Method 1 (id()) failed:', e.message);
    }
    
    // Method 2: Try finding by _id string comparison
    if (!foodItem) {
      foodItem = intake.foods.find(
        (f) => f._id && String(f._id) === String(foodItemId)
      );
    }
    
    // Method 3: Try finding by foodId (the FoodItem reference) if _id doesn't match
    if (!foodItem) {
      foodItem = intake.foods.find(
        (f) => f.foodId && String(f.foodId) === String(foodItemId)
      );
    }
    
    // Method 4: Try by index (for backwards compatibility)
    if (!foodItem && !isNaN(foodItemId)) {
      const index = parseInt(foodItemId);
      if (index >= 0 && index < intake.foods.length) {
        foodItem = intake.foods[index];
      }
    }
    
    if (!foodItem) {
      console.log('Food item not found. Available foods:', 
        intake.foods.map(f => ({
          _id: String(f._id),
          foodId: f.foodId ? String(f.foodId) : null,
          foodName: f.foodName
        }))
      );
      return res.status(404).json({
        success: false,
        message: 'Food item not found in intake',
        debug: {
          intakeId,
          foodItemId,
          totalFoods: intake.foods.length,
          foodIds: intake.foods.map((f) => String(f._id)),
          foodItemIds: intake.foods.map((f) => f.foodId ? String(f.foodId) : null),
        },
      });
    }
    
    console.log('Food item found:', {
      _id: String(foodItem._id),
      foodId: foodItem.foodId ? String(foodItem.foodId) : null,
      foodName: foodItem.foodName
    });

    // Get the subdocument ID to remove it properly
    const foodItemIdToRemove = foodItem._id ? String(foodItem._id) : foodItemId;
    
    // Subtract nutrition
    intake.totalNutrition.calories -= foodItem.nutrition.calories || 0;
    intake.totalNutrition.protein -= foodItem.nutrition.protein || 0;
    intake.totalNutrition.carbs -= foodItem.nutrition.carbs || 0;
    intake.totalNutrition.fat -= foodItem.nutrition.fat || 0;
    intake.totalCalories = intake.totalNutrition.calories;

    // Remove food item using Mongoose subdocument methods
    // Try to get the subdocument by ID first (this returns a Mongoose subdocument with remove method)
    const subdocToRemove = intake.foods.id(foodItemIdToRemove);
    if (subdocToRemove) {
      subdocToRemove.remove();
    } else {
      // Fallback: find index and use splice
      const index = intake.foods.findIndex(
        (f) => (f._id && String(f._id) === foodItemIdToRemove) ||
               (f.foodId && String(f.foodId) === foodItemIdToRemove)
      );
      if (index !== -1) {
        intake.foods.splice(index, 1);
      } else {
        return res.status(404).json({
          success: false,
          message: 'Could not remove food item from intake',
        });
      }
    }
    
    await intake.save();

    const populatedIntake = await DailyIntake.findById(intake._id)
      .populate('foods.foodId', 'name nutrition');

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('food:removed', {
        intake: populatedIntake,
        removedFoodId: foodItemId,
      });
    }

    res.status(200).json({
      success: true,
      data: populatedIntake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing food from intake',
      error: error.message,
    });
  }
};

// @desc    Add recipe to daily intake
// @route   POST /api/tracking/recipe
// @access  Private
exports.addRecipe = async (req, res) => {
  try {
    const { recipeId, mealType, date, servings = 1 } = req.body;

    if (!recipeId || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipeId and mealType',
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    const intakeDate = date ? new Date(date) : new Date();
    intakeDate.setHours(0, 0, 0, 0);

    let intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: intakeDate,
        $lt: new Date(intakeDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!intake) {
      intake = await DailyIntake.create({
        userId: req.user.id,
        date: intakeDate,
        foods: [],
        totalCalories: 0,
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
    }

    // Calculate nutrition per serving
    const nutrition = {
      calories: (recipe.nutrition.calories || 0) * servings,
      protein: (recipe.nutrition.proteins || 0) * servings,
      carbs: (recipe.nutrition.carbohydrates || 0) * servings,
      fat: (recipe.nutrition.fat || 0) * servings,
      fiber: (recipe.nutrition.fiber || 0) * servings,
    };

    // Add recipe to intake (recipeId stored in foodId field)
    intake.foods.push({
      foodId: recipe._id,
      foodName: recipe.name,
      quantity: servings,
      mealType,
      nutrition,
      loggedAt: new Date(),
    });

    // Update total nutrition
    intake.totalNutrition.calories += nutrition.calories;
    intake.totalNutrition.protein += nutrition.protein;
    intake.totalNutrition.carbs += nutrition.carbs;
    intake.totalNutrition.fat += nutrition.fat;
    if (intake.totalNutrition.fiber === undefined) {
      intake.totalNutrition.fiber = 0;
    }
    intake.totalNutrition.fiber += nutrition.fiber;
    intake.totalCalories = intake.totalNutrition.calories;

    await intake.save();

    const populatedIntake = await DailyIntake.findById(intake._id);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('food:added', {
        intake: populatedIntake,
        food: populatedIntake.foods[populatedIntake.foods.length - 1],
      });
    }

    res.status(200).json({
      success: true,
      data: populatedIntake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding recipe to intake',
      error: error.message,
    });
  }
};

// @desc    Add manual nutrition entry to daily intake
// @route   POST /api/tracking/manual
// @access  Private
exports.addManualEntry = async (req, res) => {
  try {
    const { foodName, nutrition, mealType, date } = req.body;

    if (!foodName || !nutrition || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide foodName, nutrition, and mealType',
      });
    }

    if (!nutrition.calories) {
      return res.status(400).json({
        success: false,
        message: 'Calories are required',
      });
    }

    const intakeDate = date ? new Date(date) : new Date();
    intakeDate.setHours(0, 0, 0, 0);

    let intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: intakeDate,
        $lt: new Date(intakeDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!intake) {
      intake = await DailyIntake.create({
        userId: req.user.id,
        date: intakeDate,
        foods: [],
        totalCalories: 0,
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
    }

    // Normalize nutrition data
    const normalizedNutrition = {
      calories: parseFloat(nutrition.calories) || 0,
      protein: parseFloat(nutrition.protein || nutrition.proteins || 0) || 0,
      carbs: parseFloat(nutrition.carbs || nutrition.carbohydrates || 0) || 0,
      fat: parseFloat(nutrition.fat || 0) || 0,
      fiber: parseFloat(nutrition.fiber || 0) || 0,
    };

    // Add manual entry to intake
    intake.foods.push({
      foodId: null, // No foodId for manual entries
      foodName: foodName.trim(),
      quantity: 1,
      mealType,
      nutrition: normalizedNutrition,
      loggedAt: new Date(),
    });

    // Update total nutrition
    intake.totalNutrition.calories += normalizedNutrition.calories;
    intake.totalNutrition.protein += normalizedNutrition.protein;
    intake.totalNutrition.carbs += normalizedNutrition.carbs;
    intake.totalNutrition.fat += normalizedNutrition.fat;
    if (intake.totalNutrition.fiber === undefined) {
      intake.totalNutrition.fiber = 0;
    }
    intake.totalNutrition.fiber += normalizedNutrition.fiber;
    intake.totalCalories = intake.totalNutrition.calories;

    await intake.save();

    const populatedIntake = await DailyIntake.findById(intake._id);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('food:added', {
        intake: populatedIntake,
        food: populatedIntake.foods[populatedIntake.foods.length - 1],
      });
    }

    res.status(200).json({
      success: true,
      data: populatedIntake,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding manual entry to intake',
      error: error.message,
    });
  }
};

// @desc    Finalize meal and send email notification
// @route   POST /api/tracking/finalize-meal
// @access  Private
exports.finalizeMeal = async (req, res) => {
  try {
    const { mealType, date } = req.body;

    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType',
      });
    }

    const intakeDate = date ? new Date(date) : new Date();
    intakeDate.setHours(0, 0, 0, 0);

    const intake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: intakeDate,
        $lt: new Date(intakeDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!intake) {
      return res.status(404).json({
        success: false,
        message: 'No intake found for this date',
      });
    }

    const user = await User.findById(req.user.id);
    const dailyGoal = user.healthProfile?.dailyCalorieGoal || 2000;

    // Calculate nutrition goals (standard ratios)
    const proteinRatio = 0.25; // 25% of calories from protein
    const carbsRatio = 0.45; // 45% of calories from carbs
    const fatRatio = 0.30; // 30% of calories from fat
    
    const dailyGoals = {
      calories: dailyGoal,
      protein: Math.round((dailyGoal * proteinRatio) / 4), // 4 calories per gram
      carbs: Math.round((dailyGoal * carbsRatio) / 4), // 4 calories per gram
      fat: Math.round((dailyGoal * fatRatio) / 9), // 9 calories per gram
      fiber: 25, // Recommended daily fiber
    };

    const consumed = {
      calories: intake.totalNutrition?.calories || 0,
      protein: intake.totalNutrition?.protein || 0,
      carbs: intake.totalNutrition?.carbs || 0,
      fat: intake.totalNutrition?.fat || 0,
      fiber: intake.totalNutrition?.fiber || 0,
    };

    const remaining = {
      calories: Math.max(0, dailyGoals.calories - consumed.calories),
      protein: Math.max(0, dailyGoals.protein - consumed.protein),
      carbs: Math.max(0, dailyGoals.carbs - consumed.carbs),
      fat: Math.max(0, dailyGoals.fat - consumed.fat),
      fiber: Math.max(0, dailyGoals.fiber - consumed.fiber),
    };

    const exceeded = {
      calories: Math.max(0, consumed.calories - dailyGoals.calories),
      protein: Math.max(0, consumed.protein - dailyGoals.protein),
      carbs: Math.max(0, consumed.carbs - dailyGoals.carbs),
      fat: Math.max(0, consumed.fat - dailyGoals.fat),
      fiber: Math.max(0, consumed.fiber - dailyGoals.fiber),
    };

    // Send email notification
    try {
      const { sendMealNotificationEmail } = require('../Utils/emailService');
      await sendMealNotificationEmail(user, {
        mealType,
        date: intakeDate,
        consumed,
        remaining,
        exceeded,
        dailyGoals,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Meal finalized successfully',
      data: {
        consumed,
        remaining,
        exceeded,
        dailyGoals,
        hasExceeded: consumed.calories > dailyGoals.calories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finalizing meal',
      error: error.message,
    });
  }
};

// @desc    Get user daily nutrition goals
// @route   GET /api/tracking/goals
// @access  Private
exports.getNutritionGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // First check if user has manual goals set
    if (user.manualNutritionGoals?.useManual && user.manualNutritionGoals?.calories) {
      return res.status(200).json({
        success: true,
        data: {
          calories: user.manualNutritionGoals.calories,
          protein: user.manualNutritionGoals.protein || 125,
          carbs: user.manualNutritionGoals.carbs || 225,
          fat: user.manualNutritionGoals.fat || 67,
          fiber: user.manualNutritionGoals.fiber || 25,
        },
        source: 'manual',
      });
    }

    // Otherwise calculate from user profile
    const dailyGoal = user.healthProfile?.dailyCalorieGoal || 2000;

    // Calculate nutrition goals (standard ratios)
    const proteinRatio = 0.25; // 25% of calories from protein
    const carbsRatio = 0.45; // 45% of calories from carbs
    const fatRatio = 0.30; // 30% of calories from fat
    
    const goals = {
      calories: dailyGoal,
      protein: Math.round((dailyGoal * proteinRatio) / 4), // 4 calories per gram
      carbs: Math.round((dailyGoal * carbsRatio) / 4), // 4 calories per gram
      fat: Math.round((dailyGoal * fatRatio) / 9), // 9 calories per gram
      fiber: 25, // Recommended daily fiber (g)
    };

    res.status(200).json({
      success: true,
      data: goals,
      source: 'profile',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition goals',
      error: error.message,
    });
  }
};

// @desc    Save/Update user manual nutrition goals
// @route   POST /api/tracking/goals
// @access  Private
exports.saveNutritionGoals = async (req, res) => {
  try {
    const { calories, protein, carbs, fat, fiber } = req.body;

    if (!calories || calories < 1000 || calories > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Calories must be between 1000 and 5000',
      });
    }

    const user = await User.findById(req.user.id);
    
    user.manualNutritionGoals = {
      calories: parseFloat(calories) || 2000,
      protein: parseFloat(protein) || 125,
      carbs: parseFloat(carbs) || 225,
      fat: parseFloat(fat) || 67,
      fiber: parseFloat(fiber) || 25,
      useManual: true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Nutrition goals saved successfully',
      data: user.manualNutritionGoals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving nutrition goals',
      error: error.message,
    });
  }
};

// @desc    Clear user manual nutrition goals (use profile goals instead)
// @route   DELETE /api/tracking/goals
// @access  Private
exports.clearNutritionGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.manualNutritionGoals = {
      useManual: false,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Manual nutrition goals cleared. Using profile goals now.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing nutrition goals',
      error: error.message,
    });
  }
};

