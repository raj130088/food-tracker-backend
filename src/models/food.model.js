const pool = require('../config/database');

const Food = {
  // Search foods
  async search(query) {
    const result = await pool.query(`
      SELECT * FROM foods 
      WHERE name ILIKE $1 
      ORDER BY name 
      LIMIT 20
    `, [`%${query}%`]);
    return result.rows;
  },

  // Get food by ID
  async findById(id) {
    const result = await pool.query('SELECT * FROM foods WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Add custom food
  async create(foodData, userId) {
    const { name, calories, protein, carbs, fat, serving_size } = foodData;
    
    const result = await pool.query(`
      INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, created_by, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false)
      RETURNING *
    `, [name, calories, protein, carbs, fat, serving_size, userId]);
    
    return result.rows[0];
  }
};

module.exports = Food;