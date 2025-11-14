const express = require('express');
const router = express.Router();
const {
  getDailyIntakes,
  getDailyIntake,
  addFood,
  addScannedFood,
  removeFood,
} = require('../Controllers/trackingController');
const { protect } = require('../Middlewares/auth');

// Add logging middleware to track ALL requests to help debug
router.use((req, res, next) => {
  if (req.method === 'DELETE' || req.path.includes('food')) {
    console.log(`[TRACKING ROUTES] ${req.method} request: ${req.path}`, {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    });
  }
  next();
});

router.use(protect);

router.get('/', getDailyIntakes);
router.post('/', addFood);
router.post('/scan', addScannedFood);
// DELETE route - use query parameter to avoid route conflicts
router.delete('/food', removeFood);
router.get('/:date', getDailyIntake);

module.exports = router;

