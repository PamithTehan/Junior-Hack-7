const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
} = require('../Controllers/foodController');
const { protect, authorize } = require('../Middlewares/auth');
const { upload } = require('../Config/cloudinary');

router.route('/').get(getFoods).post(protect, authorize('admin'), upload.single('image'), createFood);
router
  .route('/:id')
  .get(getFood)
  .put(protect, authorize('admin'), upload.single('image'), updateFood)
  .delete(protect, authorize('admin'), deleteFood);

module.exports = router;

