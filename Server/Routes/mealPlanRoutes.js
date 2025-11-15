const express = require('express');
const router = express.Router();
const {
  getMealPlans,
  getMealPlan,
  generateMealPlan,
  createMealPlan,
  sendMealPlanEmail,
} = require('../Controllers/mealPlanController');
const { protect } = require('../Middlewares/auth');

router.use(protect);

router.get('/', getMealPlans);
router.post('/generate', generateMealPlan);
router.get('/:id', getMealPlan);
router.post('/', createMealPlan);
router.post('/:id/email', sendMealPlanEmail);

module.exports = router;

