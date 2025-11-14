const express = require('express');
const router = express.Router();
const {
  getDietitians,
  getDietitian,
  createDietitian,
  updateDietitian,
  deleteDietitian,
} = require('../Controllers/dietitianController');
const { protect } = require('../Middlewares/auth');
const { authorize } = require('../Middlewares/auth');
const { upload } = require('../Config/cloudinary');

// Public routes
router.get('/', getDietitians);
router.get('/:id', getDietitian);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin', 'master'), upload.single('photo'), createDietitian);
router.put('/:id', protect, authorize('admin', 'master'), upload.single('photo'), updateDietitian);
router.delete('/:id', protect, authorize('admin', 'master'), deleteDietitian);

module.exports = router;

