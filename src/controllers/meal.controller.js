const Food = require('../models/food.model');
const mealService = require('../services/meal.service'); 
const analyticsService = require('../services/analytics.service');

const mealController = {
  // Search foods
  async searchFoods(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });

      const foods = await Food.search(q);
      res.json({ success: true, foods });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error searching foods' });
    }
  },

  // Log a meal
  async logMeal(req, res) {
    try {
      const userId = req.user.id;
      const mealData = req.body;

      if (!mealData.meal_type || !mealData.items || mealData.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Meal type and items are required' });
      }

      const meal = await mealService.createMeal(userId, mealData);

      res.status(201).json({
        success: true,
        message: 'Meal logged successfully',
        meal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error logging meal' });
    }
  },

  // Get today's or specific date meals
  async getMeals(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const meals = await mealService.getMealsByDate(userId, targetDate);
      res.json({ success: true, meals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching meals' });
    }
  },

  // Get daily summary with totals (Phase 3 Analytics Engine integration)
  async getDailySummary(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const summary = await analyticsService.getDailySummary(userId, targetDate);

      res.json({
        success: true,
        date: targetDate,
        summary: {
          total_calories: parseInt(summary.total_calories || 0),
          total_protein: parseFloat(summary.total_protein || 0),
          total_carbs: parseFloat(summary.total_carbs || 0),
          total_fat: parseFloat(summary.total_fat || 0),
          meal_count: parseInt(summary.meal_count || 0)
        },
        goal: {
          daily_calorie_goal: req.user.daily_calorie_goal || 2000
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching daily summary' });
    }
  },

    async getWeeklySummary(req, res) {
      try {
        const userId = req.user.id;
        const weeklyData = await analyticsService.getWeeklySummary(userId);

        res.json({
          success: true,
          weekly_summary: weeklyData
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching weekly summary' });
      }
    },

  // Get meal history
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, limit = 50, offset = 0 } = req.query;

      const history = await mealService.getHistory(userId, {
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        history,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching history' });
    }
  },

  // Delete a meal
  async deleteMeal(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const isDeleted = await mealService.deleteMeal(userId, id);

      if (!isDeleted) {
        return res.status(404).json({ success: false, message: 'Meal not found or unauthorized' });
      }

      res.json({ success: true, message: 'Meal deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting meal' });
    }
  },

  // Macro Breakdown (Phase 3 Analytics Engine integration)
  async getMacroBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const macros = await analyticsService.getMacroBreakdown(userId, targetDate);

      res.json({
        success: true,
        date: targetDate,
        macros: {
          protein: parseFloat(macros.protein || 0),
          carbs: parseFloat(macros.carbs || 0),
          fat: parseFloat(macros.fat || 0)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching macro breakdown' });
    }
  },

  // Calorie Trend (Phase 3 Analytics Engine integration)
  async getCalorieTrend(req, res) {
    try {
      const userId = req.user.id;

      const trend = await analyticsService.getCalorieTrend(userId);

      res.json({
        success: true,
        trend
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching calorie trend' });
    }
  }
};

module.exports = mealController;