const Meal = require('../models/meal.model');
const pool = require('../config/database');

const mealService = {
  // Pure CRUD for meal creation
  async createMeal(userId, mealData) {
    return await Meal.create(userId, mealData);
  },

  // Fetch meals by date criteria
  async getMealsByDate(userId, date) {
    return await Meal.getByDate(userId, date);
  },

  // Fetch log history records
  async getHistory(userId, filters) {
    return await Meal.getHistory(userId, filters);
  },

  // Pure CRUD for meal removal
  async deleteMeal(userId, mealId) {
    const result = await pool.query(
      'DELETE FROM meal_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [mealId, userId]
    );
    return result.rowCount > 0;
  }
};

module.exports = mealService;