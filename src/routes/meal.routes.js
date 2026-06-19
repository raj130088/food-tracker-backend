const express = require('express');
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const router = express.Router();

router.get('/foods/search', authMiddleware, mealController.searchFoods);
router.post('/', authMiddleware, validate('logMeal'), mealController.logMeal);
router.get('/', authMiddleware, mealController.getMeals);
router.get('/summary', authMiddleware, mealController.getDailySummary);
router.get('/weekly', authMiddleware, mealController.getWeeklySummary);
router.get('/history', authMiddleware, mealController.getHistory);
router.get('/macro-breakdown', authMiddleware, mealController.getMacroBreakdown);
router.get('/calorie-trend', authMiddleware, mealController.getCalorieTrend);
router.delete('/:id', authMiddleware, mealController.deleteMeal);

module.exports = router;