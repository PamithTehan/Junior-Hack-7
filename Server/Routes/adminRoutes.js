const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getStats,
  getUsers,
  deleteUser,
  getPendingAdmins,
  getAllAdmins,
  approveAdmin,
  removeAdmin,
  approveRecipe,
} = require('../Controllers/adminController');
const { protect } = require('../Middlewares/adminAuth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/stats', protect, getStats);
router.get('/users', protect, getUsers);
router.delete('/users/:id', protect, deleteUser);
router.get('/pending-admins', protect, getPendingAdmins);
router.get('/all-admins', protect, getAllAdmins);
router.put('/approve/:id', protect, approveAdmin);
router.delete('/:id', protect, removeAdmin);
router.put('/recipes/:id/approve', protect, approveRecipe);

module.exports = router;

