const Dietitian = require('../Models/Dietitian');
const { uploadToCloudinary } = require('../Config/cloudinary');

// @desc    Get all dietitians
// @route   GET /api/dietitians
// @access  Public
exports.getDietitians = async (req, res) => {
  try {
    const dietitians = await Dietitian.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: dietitians,
      count: dietitians.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dietitians',
      error: error.message,
    });
  }
};

// @desc    Get single dietitian
// @route   GET /api/dietitians/:id
// @access  Public
exports.getDietitian = async (req, res) => {
  try {
    const dietitian = await Dietitian.findById(req.params.id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found',
      });
    }
    res.status(200).json({
      success: true,
      data: dietitian,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dietitian',
      error: error.message,
    });
  }
};

// @desc    Create dietitian
// @route   POST /api/dietitians
// @access  Private (Admin only)
exports.createDietitian = async (req, res) => {
  try {
    const { name, description, contactNumber, contactInfo } = req.body;

    // Validation
    if (!name || !description || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and contact number',
      });
    }

    let photo = null;
    let cloudinaryId = null;

    // Handle photo upload if provided
    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          'sri-lankan-nutrition/dietitians',
          { resourceType: 'image' }
        );
        photo = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading photo',
          error: uploadError.message,
        });
      }
    }

    const dietitian = await Dietitian.create({
      name,
      description,
      contactNumber,
      contactInfo: contactInfo || '',
      photo,
      cloudinaryId,
      createdBy: req.user.id || req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Dietitian created successfully',
      data: dietitian,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating dietitian',
      error: error.message,
    });
  }
};

// @desc    Update dietitian
// @route   PUT /api/dietitians/:id
// @access  Private (Admin only)
exports.updateDietitian = async (req, res) => {
  try {
    let dietitian = await Dietitian.findById(req.params.id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found',
      });
    }

    const { name, description, contactNumber, contactInfo } = req.body;

    // Update fields
    if (name) dietitian.name = name;
    if (description) dietitian.description = description;
    if (contactNumber) dietitian.contactNumber = contactNumber;
    if (contactInfo !== undefined) dietitian.contactInfo = contactInfo;

    // Handle photo upload if provided
    if (req.file && req.file.buffer) {
      try {
        // Delete old photo from Cloudinary if exists
        if (dietitian.cloudinaryId) {
          const cloudinary = require('cloudinary').v2;
          try {
            await cloudinary.uploader.destroy(dietitian.cloudinaryId);
          } catch (deleteError) {
            console.error('Error deleting old photo:', deleteError);
          }
        }

        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          'sri-lankan-nutrition/dietitians',
          { resourceType: 'image' }
        );
        dietitian.photo = uploadResult.secure_url;
        dietitian.cloudinaryId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading photo',
          error: uploadError.message,
        });
      }
    }

    await dietitian.save();

    res.status(200).json({
      success: true,
      message: 'Dietitian updated successfully',
      data: dietitian,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating dietitian',
      error: error.message,
    });
  }
};

// @desc    Delete dietitian
// @route   DELETE /api/dietitians/:id
// @access  Private (Admin only)
exports.deleteDietitian = async (req, res) => {
  try {
    const dietitian = await Dietitian.findById(req.params.id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found',
      });
    }

    // Delete photo from Cloudinary if exists
    if (dietitian.cloudinaryId) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(dietitian.cloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting photo from Cloudinary:', deleteError);
        // Continue with deletion even if photo delete fails
      }
    }

    await Dietitian.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Dietitian deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting dietitian',
      error: error.message,
    });
  }
};

