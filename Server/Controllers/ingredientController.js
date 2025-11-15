const Ingredient = require('../Models/Ingredient');

// @desc    Get all ingredients with optional search and filter
// @route   GET /api/ingredients
// @access  Public
exports.getIngredients = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const query = {};

    // Search filter - search in name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ingredients = await Ingredient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ingredient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: ingredients.length,
      total,
      data: ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredients',
      error: error.message,
    });
  }
};

// @desc    Get single ingredient
// @route   GET /api/ingredients/:id
// @access  Public
exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredient',
      error: error.message,
    });
  }
};

// @desc    Create new ingredient
// @route   POST /api/ingredients
// @access  Private/Admin
exports.createIngredient = async (req, res) => {
  try {
    const { name, category, nutrition, tags } = req.body;

    // Validation
    if (!name || !category || !nutrition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, and nutrition information',
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

    const ingredientData = {
      name: name.trim(),
      category,
      nutrition: {
        calories: parseFloat(nutrition.calories) || 0,
        carbohydrates: parseFloat(nutrition.carbohydrates) || 0,
        proteins: parseFloat(nutrition.proteins) || 0,
        fiber: parseFloat(nutrition.fiber) || 0,
        fat: parseFloat(nutrition.fat) || 0,
      },
    };

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      ingredientData.tags = tags.map(tag => tag.trim()).filter(tag => tag);
    }

    const ingredient = await Ingredient.create(ingredientData);

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ingredient',
      error: error.message,
    });
  }
};

// @desc    Update ingredient
// @route   PUT /api/ingredients/:id
// @access  Private/Admin
exports.updateIngredient = async (req, res) => {
  try {
    let ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found',
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
        calories: parseFloat(updateData.nutrition.calories) || ingredient.nutrition.calories,
        carbohydrates: parseFloat(updateData.nutrition.carbohydrates) ?? ingredient.nutrition.carbohydrates,
        proteins: parseFloat(updateData.nutrition.proteins) ?? ingredient.nutrition.proteins,
        fiber: parseFloat(updateData.nutrition.fiber) ?? ingredient.nutrition.fiber,
        fat: parseFloat(updateData.nutrition.fat) ?? ingredient.nutrition.fat,
      };
    }

    ingredient = await Ingredient.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Ingredient updated successfully',
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ingredient',
      error: error.message,
    });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found',
      });
    }

    await Ingredient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ingredient deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ingredient',
      error: error.message,
    });
  }
};



