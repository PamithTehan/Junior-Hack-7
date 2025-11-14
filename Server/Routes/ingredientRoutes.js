const express = require('express');
const router = express.Router();
const {
  getIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../Controllers/ingredientController');
const { protect, authorize } = require('../Middlewares/auth');

router.route('/')
  .get(getIngredients)
  .post(protect, authorize('admin'), createIngredient);

router
  .route('/:id')
  .get(getIngredient)
  .put(protect, authorize('admin'), updateIngredient)
  .delete(protect, authorize('admin'), deleteIngredient);

module.exports = router;

