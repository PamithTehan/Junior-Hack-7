const Recipe = require('../Models/Recipe');

// @desc    Get all recipes with optional search and filter
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.si': { $regex: search, $options: 'i' } },
        { 'name.ta': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Only show approved recipes to regular users (admins can see all)
    const isAdmin = (req.user && (req.user.role === 'admin' || req.user.role === 'master')) || 
                    (req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'master')) ||
                    req.isAdmin;
    if (!isAdmin) {
      query.isApproved = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recipes = await Recipe.find(query)
      .populate('ingredients.foodId', 'name nutrition servingSize')
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
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.foodId', 'name nutrition servingSize');

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
    // This will be enhanced later
    res.status(501).json({
      success: false,
      message: 'Recipe creation will be implemented in the next phase',
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
    // This will be enhanced later
    res.status(501).json({
      success: false,
      message: 'Recipe update will be implemented in the next phase',
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

    // Delete image from Cloudinary if exists
    if (recipe.cloudinaryId) {
      try {
        const { deleteFromCloudinary } = require('../Config/cloudinary');
        await deleteFromCloudinary(recipe.cloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
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

