const { uploadToCloudinary } = require('../Config/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        cloudinaryId: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

