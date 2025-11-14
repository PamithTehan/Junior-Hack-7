const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} = require('../Controllers/authController');
const { protect } = require('../Middlewares/auth');
const { upload } = require('../Config/cloudinary');

// Register with file upload support (multiple files for medical reports)
router.post('/register', upload.array('medicalReports', 10), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;

