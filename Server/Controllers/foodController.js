const FoodItem = require('../Models/FoodItem');
const { uploadToCloudinary } = require('../Config/cloudinary');

// @desc    Get all food items with optional search and filter
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Only show approved foods to regular users (admins can see all)
    // Check if user is admin/master (either through req.user or req.adminUser)
    const isAdmin = (req.user && (req.user.role === 'admin' || req.user.role === 'master')) || 
                    (req.adminUser && (req.adminUser.role === 'admin' || req.adminUser.role === 'master')) ||
                    req.isAdmin;
    if (!isAdmin) {
      query.isApproved = { $ne: false }; // Show approved foods (default is true)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const foods = await FoodItem.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodItem.countDocuments(query);

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

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
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

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Admin
exports.createFood = async (req, res) => {
  try {
    const foodData = { ...req.body };

    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        foodData.image = result.secure_url;
        foodData.cloudinaryId = result.public_id;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error: uploadError.message,
        });
      }
    } else if (req.body.image) {
      foodData.image = req.body.image;
      foodData.cloudinaryId = req.body.cloudinaryId;
    }

    // Parse JSON fields if they're strings
    if (typeof foodData.name === 'string') {
      foodData.name = JSON.parse(foodData.name);
    }
    if (typeof foodData.nutrition === 'string') {
      foodData.nutrition = JSON.parse(foodData.nutrition);
    }
    if (typeof foodData.tags === 'string') {
      foodData.tags = JSON.parse(foodData.tags);
    }

    const food = await FoodItem.create(foodData);

    res.status(201).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating food item',
      error: error.message,
    });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res) => {
  try {
    let food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    const updateData = { ...req.body };

    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
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

    // Parse JSON fields if they're strings
    if (typeof updateData.name === 'string') {
      updateData.name = JSON.parse(updateData.name);
    }
    if (typeof updateData.nutrition === 'string') {
      updateData.nutrition = JSON.parse(updateData.nutrition);
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    food = await FoodItem.findByIdAndUpdate(req.params.id, updateData, {
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
      message: 'Error updating food item',
      error: error.message,
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    await FoodItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting food item',
      error: error.message,
    });
  }
};

