const pool = require('../config/database');

const analyticsService = {
  // Daily Summary
  async getDailySummary(userId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(COALESCE(mi.custom_calories, 0)), 0) as total_calories,
        COALESCE(SUM(COALESCE(mi.custom_protein, 0)), 0) as total_protein,
        COALESCE(SUM(COALESCE(mi.custom_carbs, 0)), 0) as total_carbs,
        COALESCE(SUM(COALESCE(mi.custom_fat, 0)), 0) as total_fat,
        COUNT(DISTINCT ml.id) as meal_count
      FROM meal_logs ml
      LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
      WHERE ml.user_id = $1 AND ml.log_date = $2
    `, [userId, targetDate]);

    return result.rows[0] || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 };
  },

  // Weekly Summary
  async getWeeklySummary(userId) {
    const result = await pool.query(`
      SELECT 
        DATE(ml.log_date) as date,
        TO_CHAR(ml.log_date, 'Mon DD') as date_label,
        SUM(COALESCE(mi.custom_calories, 0)) as total_calories
      FROM meal_logs ml
      LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
      WHERE ml.user_id = $1 
        AND ml.log_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY ml.log_date
      ORDER BY ml.log_date DESC
    `, [userId]);

    return result.rows;
  },

  // Macro Breakdown (for pie chart)
  async getMacroBreakdown(userId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(COALESCE(mi.custom_protein, 0)), 0) as protein,
        COALESCE(SUM(COALESCE(mi.custom_carbs, 0)), 0) as carbs,
        COALESCE(SUM(COALESCE(mi.custom_fat, 0)), 0) as fat
      FROM meal_logs ml
      LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
      WHERE ml.user_id = $1 AND ml.log_date = $2
    `, [userId, targetDate]);

    return result.rows[0] || { protein: 0, carbs: 0, fat: 0 };
  },

  // Calorie Trend (last 7 days)
  async getCalorieTrend(userId) {
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

    return result.rows;
  }
};

module.exports = analyticsService;