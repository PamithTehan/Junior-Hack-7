const MealPlan = require('../Models/MealPlan');
const FoodItem = require('../Models/FoodItem');
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
      .populate('meals.items.foodId', 'name nutrition servingSize image')
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
    }).populate('meals.items.foodId', 'name nutrition servingSize image');

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

// @desc    Generate meal plan for a date
// @route   POST /api/mealplans/generate
// @access  Private
exports.generateMealPlan = async (req, res) => {
  try {
    const { date } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.healthProfile.dailyCalorieGoal) {
      return res.status(400).json({
        success: false,
        message: 'Please update your health profile with weight, height, and activity level',
      });
    }

    const targetCalories = user.healthProfile.dailyCalorieGoal;
    const calorieDistribution = {
      breakfast: 0.25, // 25%
      lunch: 0.35, // 35%
      dinner: 0.30, // 30%
      snack: 0.10, // 10%
    };

    // Get food items based on user's health conditions
    let foodQuery = {};
    if (user.healthProfile.healthConditions?.includes('diabetes')) {
      foodQuery.tags = { $in: ['diabetes-friendly'] };
    }
    if (user.healthProfile.healthConditions?.includes('heart_disease')) {
      foodQuery.tags = { $in: ['heart-healthy'] };
    }

    const availableFoods = await FoodItem.find({
      ...foodQuery,
      isTraditional: true,
    }).limit(50);

    if (availableFoods.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No suitable foods found for your health profile',
      });
    }

    // Generate meals
    const meals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    for (const mealType of mealTypes) {
      const mealCalories = targetCalories * calorieDistribution[mealType];
      const mealItems = selectFoodsForMeal(availableFoods, mealCalories, mealType);
      
      const totalNutrition = mealItems.reduce((acc, item) => ({
        calories: acc.calories + (item.nutrition.calories * item.quantity),
        protein: acc.protein + (item.nutrition.protein * item.quantity),
        carbs: acc.carbs + (item.nutrition.carbs * item.quantity),
        fat: acc.fat + (item.nutrition.fat * item.quantity),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      meals.push({
        mealType,
        items: mealItems,
        totalNutrition,
      });
    }

    // Calculate total nutrition
    const totalNutrition = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalNutrition.calories,
      protein: acc.protein + meal.totalNutrition.protein,
      carbs: acc.carbs + meal.totalNutrition.carbs,
      fat: acc.fat + meal.totalNutrition.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Check if meal plan already exists for this date
    let mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      date: new Date(date),
    });

    if (mealPlan) {
      mealPlan.meals = meals;
      mealPlan.totalNutrition = totalNutrition;
      await mealPlan.save();
    } else {
      mealPlan = await MealPlan.create({
        userId: req.user.id,
        date: new Date(date),
        meals,
        totalNutrition,
      });
    }

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('meals.items.foodId', 'name nutrition servingSize image');

    res.status(200).json({
      success: true,
      data: populatedMealPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating meal plan',
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
        const food = await FoodItem.findById(item.foodId);
        if (food) {
          const quantity = item.quantity || 1;
          totalNutrition.calories += food.nutrition.calories * quantity;
          totalNutrition.protein += food.nutrition.protein * quantity;
          totalNutrition.carbs += food.nutrition.carbs * quantity;
          totalNutrition.fat += food.nutrition.fat * quantity;
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
      .populate('meals.items.foodId', 'name nutrition servingSize image');

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

// Helper function to select foods for a meal
function selectFoodsForMeal(foods, targetCalories, mealType) {
  const mealItems = [];
  let currentCalories = 0;
  const selectedFoods = new Set();

  // Filter foods appropriate for meal type
  const appropriateFoods = foods.filter(food => {
    if (mealType === 'breakfast') {
      return food.category === 'bread' || food.category === 'rice' || food.tags?.includes('breakfast');
    }
    return true;
  });

  // Simple selection algorithm
  const shuffled = [...appropriateFoods].sort(() => Math.random() - 0.5);
  
  for (const food of shuffled) {
    if (currentCalories >= targetCalories * 0.9) break; // 90% of target
    if (selectedFoods.has(food._id.toString())) continue;

    const caloriesPerServing = food.nutrition.calories;
    const quantity = Math.min(2, Math.ceil((targetCalories - currentCalories) / caloriesPerServing));

    if (quantity > 0) {
      mealItems.push({
        foodId: food._id,
        foodName: food.name.en,
        quantity: quantity,
        nutrition: {
          calories: food.nutrition.calories,
          protein: food.nutrition.protein,
          carbs: food.nutrition.carbs,
          fat: food.nutrition.fat,
        },
      });

      currentCalories += caloriesPerServing * quantity;
      selectedFoods.add(food._id.toString());
    }
  }

  return mealItems;
}

