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

router.route('/')
  .get(getRecipes)
  .post(protect, authorize('admin'), createRecipe);

router
  .route('/:id')
  .get(getRecipe)
  .put(protect, authorize('admin'), updateRecipe)
  .delete(protect, authorize('admin'), deleteRecipe);

module.exports = router;
