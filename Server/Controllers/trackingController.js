const DailyIntake = require('../Models/DailyIntake');
const Ingredient = require('../Models/Ingredient');

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

