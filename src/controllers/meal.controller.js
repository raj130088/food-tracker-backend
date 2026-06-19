const Food = require('../models/food.model');
const Meal = require('../models/meal.model');
const pool = require('../config/database');

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

      const meal = await Meal.create(userId, mealData);

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

      const meals = await Meal.getByDate(userId, date || new Date().toISOString().split('T')[0]);
      res.json({ success: true, meals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching meals' });
    }
  },

    // Get daily summary with totals
  async getDailySummary(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const result = await pool.query(`
        SELECT 
          COALESCE(SUM(mi.custom_calories), 0) as total_calories,
          COALESCE(SUM(mi.custom_protein), 0) as total_protein,
          COALESCE(SUM(mi.custom_carbs), 0) as total_carbs,
          COALESCE(SUM(mi.custom_fat), 0) as total_fat,
          COUNT(DISTINCT ml.id) as meal_count
        FROM meal_logs ml
        LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
        WHERE ml.user_id = $1 AND ml.log_date = $2
      `, [userId, targetDate]);

      const summary = result.rows[0];

      res.json({
        success: true,
        date: targetDate,
        summary: {
          total_calories: parseInt(summary.total_calories),
          total_protein: parseFloat(summary.total_protein),
          total_carbs: parseFloat(summary.total_carbs),
          total_fat: parseFloat(summary.total_fat),
          meal_count: parseInt(summary.meal_count)
        },
        goal: {
          daily_calorie_goal: req.user.daily_calorie_goal
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching daily summary' });
    }
  },

  // Get weekly summary
  async getWeeklySummary(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(`
        SELECT 
          DATE(log_date) as date,
          SUM(COALESCE(mi.custom_calories, 0)) as total_calories
        FROM meal_logs ml
        LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
        WHERE ml.user_id = $1 
          AND ml.log_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(log_date)
        ORDER BY date DESC
      `, [userId]);

      res.json({
        success: true,
        weekly_summary: result.rows
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

      const history = await Meal.getHistory(userId, {
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

    // Macro breakdown for pie chart
  async getMacroBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const result = await pool.query(`
        SELECT 
          COALESCE(SUM(mi.custom_protein), 0) as protein,
          COALESCE(SUM(mi.custom_carbs), 0) as carbs,
          COALESCE(SUM(mi.custom_fat), 0) as fat
        FROM meal_logs ml
        LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
        WHERE ml.user_id = $1 AND ml.log_date = $2
      `, [userId, targetDate]);

      const data = result.rows[0];

      res.json({
        success: true,
        date: targetDate,
        macros: {
          protein: parseFloat(data.protein),
          carbs: parseFloat(data.carbs),
          fat: parseFloat(data.fat)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching macro breakdown' });
    }
  },

  // Calorie trend for line chart (last 7 days)
  async getCalorieTrend(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(`
        SELECT 
          TO_CHAR(ml.log_date, 'Mon DD') as date_label,
          ml.log_date,
          SUM(COALESCE(mi.custom_calories, 0)) as total_calories
        FROM meal_logs ml
        LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
        WHERE ml.user_id = $1 
          AND ml.log_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY ml.log_date
        ORDER BY ml.log_date ASC
      `, [userId]);

      res.json({
        success: true,
        trend: result.rows
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching calorie trend' });
    }
  },

    // Delete a meal
  async deleteMeal(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM meal_logs WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Meal not found or unauthorized' });
      }

      res.json({ success: true, message: 'Meal deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting meal' });
    }
  }
};

module.exports = mealController;