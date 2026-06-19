const pool = require('../config/database');

const Meal = {
  // Create a new meal log with items
  async create(userId, mealData) {
    const { meal_type, log_date, time, notes, items } = mealData;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create meal log
      const mealResult = await client.query(`
        INSERT INTO meal_logs (user_id, meal_type, log_date, time, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, meal_type, log_date || new Date().toISOString().split('T')[0], time, notes]);

      const mealLog = mealResult.rows[0];

      // Add meal items
      for (const item of items) {
        await client.query(`
          INSERT INTO meal_items 
          (meal_log_id, food_id, quantity, custom_calories, custom_protein, custom_carbs, custom_fat)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          mealLog.id, 
          item.food_id, 
          item.quantity, 
          item.custom_calories, 
          item.custom_protein, 
          item.custom_carbs, 
          item.custom_fat
        ]);
      }

      await client.query('COMMIT');
      return mealLog;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get meals for a specific date
  async getByDate(userId, date) {
    const result = await pool.query(`
      SELECT ml.*, 
             json_agg(mi.*) as items
      FROM meal_logs ml
      LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
      WHERE ml.user_id = $1 AND ml.log_date = $2
      GROUP BY ml.id
      ORDER BY ml.time
    `, [userId, date]);
    return result.rows;
  },

    // Get meal history with pagination and date filter
  async getHistory(userId, { startDate, endDate, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        ml.*,
        json_agg(
          json_build_object(
            'id', mi.id,
            'food_id', mi.food_id,
            'quantity', mi.quantity,
            'custom_calories', mi.custom_calories,
            'custom_protein', mi.custom_protein,
            'custom_carbs', mi.custom_carbs,
            'custom_fat', mi.custom_fat
          )
        ) as items
      FROM meal_logs ml
      LEFT JOIN meal_items mi ON ml.id = mi.meal_log_id
      WHERE ml.user_id = $1
    `;

    const params = [userId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND ml.log_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND ml.log_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += `
      GROUP BY ml.id
      ORDER BY ml.log_date DESC, ml.time DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }
};

module.exports = Meal;