const Recipe = require('../Models/Recipe');

// @desc    Get all recipes with optional search and filter
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    const { search, dietaryType, tag, nutritionFilter, page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter out street foods - exclude recipes with street food tags
    // This will match recipes where tags doesn't exist, is empty, or doesn't contain street food tags
    const streetFoodTags = ['street-food', 'street food', 'fast-food', 'fast food'];
    const andConditions = [
      {
        $or: [
          { tags: { $exists: false } },
          { tags: { $size: 0 } },
          { tags: { $nin: streetFoodTags } }
        ]
      }
    ];

    // Dietary type filter
    if (dietaryType && ['vegan', 'vegetarian', 'non-vegetarian'].includes(dietaryType)) {
      query.dietaryType = dietaryType;
    }

    // Tag filter
    if (tag && tag.trim() !== '') {
      andConditions.push({
        tags: { $in: [new RegExp(tag.trim(), 'i')] }
      });
    }

    // Nutrition-based filter
    if (nutritionFilter) {
      switch (nutritionFilter) {
        case 'low-calorie':
          query['nutrition.calories'] = { $lt: 200 };
          break;
        case 'high-protein':
          query['nutrition.proteins'] = { $gt: 15 };
          break;
        case 'low-carb':
          query['nutrition.carbohydrates'] = { $lt: 30 };
          break;
        case 'high-fiber':
          query['nutrition.fiber'] = { $gt: 5 };
          break;
        case 'low-fat':
          query['nutrition.fat'] = { $lt: 10 };
          break;
        case 'balanced':
          // Balanced: moderate calories (150-400), good protein (10-25g)
          andConditions.push({
            $and: [
              { 'nutrition.calories': { $gte: 150, $lte: 400 } },
              { 'nutrition.proteins': { $gte: 10, $lte: 25 } }
            ]
          });
          break;
        default:
          break;
      }
    }

    // Search filter
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mainIngredient: { $regex: search, $options: 'i' } },
        ]
      });
    }

    // Combine all conditions with $and
    if (andConditions.length > 0) {
      if (!query.$and) {
        query.$and = [];
      }
      query.$and.push(...andConditions);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments(query);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message,
    });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe',
      error: error.message,
    });
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private/Admin
exports.createRecipe = async (req, res) => {
  try {
    const { name, mainIngredient, otherIngredients, instructions, nutrition, dietaryType, tags } = req.body;

    // Validation
    if (!name || !mainIngredient || !instructions || !nutrition || !dietaryType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, mainIngredient, instructions, nutrition information, and dietaryType',
      });
    }

    // Validate dietary type
    if (!['vegan', 'vegetarian', 'non-vegetarian'].includes(dietaryType)) {
      return res.status(400).json({
        success: false,
        message: 'Dietary type must be one of: vegan, vegetarian, non-vegetarian',
      });
    }

    // Validate nutrition fields
    if (typeof nutrition.calories === 'undefined' || 
        typeof nutrition.carbohydrates === 'undefined' ||
        typeof nutrition.proteins === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Please provide calories, carbohydrates, and proteins values',
      });
    }

    const recipeData = {
      name: name.trim(),
      mainIngredient: mainIngredient.trim(),
      otherIngredients: Array.isArray(otherIngredients) 
        ? otherIngredients.map(ing => ing.trim()).filter(ing => ing)
        : [],
      instructions: instructions.trim(),
      dietaryType: dietaryType.trim(),
      nutrition: {
        calories: parseFloat(nutrition.calories) || 0,
        carbohydrates: parseFloat(nutrition.carbohydrates) || 0,
        proteins: parseFloat(nutrition.proteins) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        fiber: parseFloat(nutrition.fiber) || 0,
      },
    };

    // Add tags if provided (filter out street-food tags)
    if (tags && Array.isArray(tags) && tags.length > 0) {
      recipeData.tags = tags.map(tag => tag.trim())
        .filter(tag => tag && !['street-food', 'street food', 'fast-food', 'fast food'].includes(tag.toLowerCase()));
    }

    const recipe = await Recipe.create(recipeData);

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: error.message,
    });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
exports.updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    const updateData = { ...req.body };

    // Parse nutrition if it's a string
    if (updateData.nutrition && typeof updateData.nutrition === 'string') {
      try {
        updateData.nutrition = JSON.parse(updateData.nutrition);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid nutrition data format',
        });
      }
    }

    // Parse otherIngredients if it's a string
    if (updateData.otherIngredients && typeof updateData.otherIngredients === 'string') {
      try {
        updateData.otherIngredients = JSON.parse(updateData.otherIngredients);
      } catch (e) {
        updateData.otherIngredients = [];
      }
    }

    // Parse tags if it's a string
    if (updateData.tags && typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = [];
      }
    }

    // Ensure nutrition values are numbers
    if (updateData.nutrition) {
      updateData.nutrition = {
        calories: parseFloat(updateData.nutrition.calories) ?? recipe.nutrition.calories,
        carbohydrates: parseFloat(updateData.nutrition.carbohydrates) ?? recipe.nutrition.carbohydrates,
        proteins: parseFloat(updateData.nutrition.proteins) ?? recipe.nutrition.proteins,
        fat: parseFloat(updateData.nutrition.fat) ?? recipe.nutrition.fat,
        fiber: parseFloat(updateData.nutrition.fiber) ?? recipe.nutrition.fiber,
      };
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating recipe',
      error: error.message,
    });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe',
      error: error.message,
    });
  }
};
