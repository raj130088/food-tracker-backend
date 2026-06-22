// src/models/meal.model.js
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

      // Add meal items with Fuzzy Database Matching
      // Track unmatched items for warning response
      const unmatchedItems = [];

      // Add meal items with Fuzzy Database Matching
      for (const item of items) {
        let finalFoodId = item.food_id || null;
        let cal = item.custom_calories || 0;
        let pro = item.custom_protein || 0;
        let carb = item.custom_carbs || 0;
        let fat = item.custom_fat || 0;

        // Bypassing text tracking gaps: If food_id is missing but we have a text string name from AI
        if (!finalFoodId && item.name) {
          const cleanName = item.name.toLowerCase().trim();
          
          // Case insensitive matching with simple plural fallback (dropping trailing 's')
          const foodSearch = await client.query(`
            SELECT id, calories, protein, carbs, fat,
                  CASE 
                    WHEN LOWER(name) = $1 THEN 1
                    WHEN LOWER(name) LIKE $2 THEN 2
                    WHEN $1 LIKE '%' || LOWER(name) || '%' THEN 3
                    ELSE 4
                  END as match_priority
            FROM public.foods 
            WHERE LOWER(name) = $1 
              OR LOWER(name) LIKE $2 
              OR $1 LIKE '%' || LOWER(name) || '%'
            ORDER BY match_priority, LENGTH(name) DESC
            LIMIT 1
          `, [cleanName, `%${cleanName.replace(/s$/, '')}%`]);

          if (foodSearch.rows.length > 0) {
            const food = foodSearch.rows[0];
            finalFoodId = food.id;
            
            // Quantify and scale base nutritional metrics automatically
            cal = Math.round(food.calories * item.quantity);
            pro = parseFloat((food.protein * item.quantity).toFixed(2));
            carb = parseFloat((food.carbs * item.quantity).toFixed(2));
            fat = parseFloat((food.fat * item.quantity).toFixed(2));
          } else {
            // Track unmatched items
            unmatchedItems.push(item.name);
          }
        } else if (!finalFoodId && !item.name) {
          // If no food_id and no name, track as unknown
          unmatchedItems.push('Unknown item');
        }

        // Insert into the items table using either user-supplied or AI-calculated values
        await client.query(`
          INSERT INTO meal_items 
          (meal_log_id, food_id, quantity, custom_calories, custom_protein, custom_carbs, custom_fat)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          mealLog.id, 
          finalFoodId, 
          item.quantity, 
          cal, 
          pro, 
          carb, 
          fat
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