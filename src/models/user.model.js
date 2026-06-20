const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  // Create new user
  async create(userData) {
    const { email, password, name, age, gender, height, weight, activity_level, daily_calorie_goal } = userData;
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (email, password_hash, name, age, gender, height, weight, activity_level, daily_calorie_goal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, name, daily_calorie_goal, created_at
    `;

    const result = await pool.query(query, [
      email, password_hash, name, age, gender, height, weight, activity_level, daily_calorie_goal || 2000
    ]);

    return result.rows[0];
  },

  // Find user by email (for login)
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Find user by ID (for protected routes)
  async findById(id) {
    const result = await pool.query('SELECT id, email, name, daily_calorie_goal, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Update user profile/goals
  async update(id, updateData) {
    const allowedFields = [
      'name', 'age', 'gender', 'height', 'weight', 'activity_level', 
      'daily_calorie_goal', 'protein_goal', 'carb_goal', 'fat_goal',
      'diet_type', 'allergies', 'food_preferences', 'food_dislikes'
    ];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) return null;

    values.push(id); // for WHERE clause

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, name, daily_calorie_goal, protein_goal, carb_goal, fat_goal
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

module.exports = User;