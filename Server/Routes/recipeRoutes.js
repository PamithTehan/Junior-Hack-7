const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../Controllers/recipeController');
const { protect, authorize } = require('../Middlewares/auth');
const { optionalAdmin } = require('../Middlewares/optionalAdmin');
const { upload } = require('../Config/cloudinary');

router.route('/').get(optionalAdmin, getRecipes).post(protect, authorize('admin'), upload.single('image'), createRecipe);
router
  .route('/:id')
  .get(getRecipe)
  .put(protect, authorize('admin'), upload.single('image'), updateRecipe)
  .delete(protect, authorize('admin'), deleteRecipe);

module.exports = router;

