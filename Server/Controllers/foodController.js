const Food = require('../Models/Food');
const { uploadToCloudinary } = require('../Config/cloudinary');

// @desc    Get all foods with optional search and filter
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query;
    const query = {};

    // Search filter - search in name fields
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.si': { $regex: search, $options: 'i' } },
        { 'name.ta': { $regex: search, $options: 'i' } },
      ];
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Only show approved foods to regular users (admins can see all)
    const isAdmin = (req.user && (req.user.role === 'admin' || req.user.role === 'master')) || 
                    (req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'master')) ||
                    req.isAdmin;
    if (!isAdmin) {
      query.isApproved = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const foods = await Food.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Food.countDocuments(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching foods',
      error: error.message,
    });
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food',
      error: error.message,
    });
  }
};

// @desc    Create new food
// @route   POST /api/foods
// @access  Private/Admin
exports.createFood = async (req, res) => {
  try {
    const { name, type, nutrition, servingSize } = req.body;

    // Validation
    if (!name || !type || !nutrition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type, and nutrition information',
      });
    }

    // Validate nutrition fields
    if (typeof nutrition.calories === 'undefined' || 
        typeof nutrition.protein === 'undefined' ||
        typeof nutrition.carbohydrates === 'undefined' ||
        typeof nutrition.fat === 'undefined' ||
        typeof nutrition.fiber === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Please provide all nutrition values: calories, protein, carbohydrates, fat, and fiber',
      });
    }

    const foodData = {
      name: typeof name === 'string' ? JSON.parse(name) : name,
      type,
      nutrition: {
        calories: parseFloat(nutrition.calories) || 0,
        protein: parseFloat(nutrition.protein) || 0,
        carbohydrates: parseFloat(nutrition.carbohydrates) || 0,
        fat: parseFloat(nutrition.fat) || 0,
        fiber: parseFloat(nutrition.fiber) || 0,
      },
      servingSize: servingSize || '100g',
    };

    // Set createdBy if user is authenticated
    if (req.user) {
      foodData.createdBy = req.user.id;
    } else if (req.admin) {
      foodData.createdBy = req.admin.id;
    }

    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'sri-lankan-nutrition/foods');
        foodData.image = result.secure_url;
        foodData.cloudinaryId = result.public_id;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error: uploadError.message,
        });
      }
    }

    const food = await Food.create(foodData);

    res.status(201).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating food',
      error: error.message,
    });
  }
};

// @desc    Update food
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    const updateData = { ...req.body };

    // Parse JSON fields if they're strings
    if (updateData.name && typeof updateData.name === 'string') {
      updateData.name = JSON.parse(updateData.name);
    }
    if (updateData.nutrition && typeof updateData.nutrition === 'string') {
      updateData.nutrition = JSON.parse(updateData.nutrition);
    }

    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        // Delete old image if exists
        if (food.cloudinaryId) {
          const { deleteFromCloudinary } = require('../Config/cloudinary');
          await deleteFromCloudinary(food.cloudinaryId);
        }
        const result = await uploadToCloudinary(req.file.buffer, 'sri-lankan-nutrition/foods');
        updateData.image = result.secure_url;
        updateData.cloudinaryId = result.public_id;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error: uploadError.message,
        });
      }
    }

    food = await Food.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating food',
      error: error.message,
    });
  }
};

// @desc    Delete food
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    // Delete image from Cloudinary if exists
    if (food.cloudinaryId) {
      try {
        const { deleteFromCloudinary } = require('../Config/cloudinary');
        await deleteFromCloudinary(food.cloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with food deletion even if image deletion fails
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Food deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting food',
      error: error.message,
    });
  }
};
