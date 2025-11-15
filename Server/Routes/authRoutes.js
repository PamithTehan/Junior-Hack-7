const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updateEmail,
  updatePassword,
  updateName,
  logout,
} = require('../Controllers/authController');
const { protect } = require('../Middlewares/auth');
const { upload } = require('../Config/cloudinary');

// Register with file upload support (multiple files for medical reports)
router.post('/register', upload.array('medicalReports', 10), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update-email', protect, updateEmail);
router.put('/update-password', protect, updatePassword);
router.put('/update-name', protect, updateName);
router.post('/logout', protect, logout);

// @desc    Check email availability
// @route   GET /api/auth/check-email/:email
// @access  Public
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Invalid email format',
      });
    }

    // Check if email exists
    const User = require('../Models/User');
    const existingUser = await User.findOne({ email: normalizedEmail });

    res.status(200).json({
      success: true,
      available: !existingUser,
      email: normalizedEmail,
      message: existingUser 
        ? 'This email is already registered' 
        : 'This email is available',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      available: false,
      message: 'Error checking email availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

