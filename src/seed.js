// src/seed.js
const pool = require('./config/database');
const bcrypt = require('bcryptjs'); // Swapped to bcryptjs to avoid Docker compilation limits

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create a Mock User matching exact schema types
    const mockEmail = 'coach.tester@example.com';
    const checkUser = await client.query('SELECT id FROM users WHERE email = $1', [mockEmail]);
    
    let userId;
    if (checkUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userResult = await client.query(`
        INSERT INTO public.users (
          email, password_hash, name, age, gender, height, weight, 
          activity_level, daily_calorie_goal, diet_type, allergies, 
          food_preferences, food_dislikes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        mockEmail, hashedPassword, 'Amrit Tester', 28, 'Male', 180.00, 75.00,
        'Active', 2200, 'none', ['peanuts'], ['chicken', 'rice'], ['broccoli']
      ]);
      userId = userResult.rows[0].id;
      console.log(`👤 Created mock user with ID: ${userId}`);
    } else {
      userId = checkUser.rows[0].id;
      console.log(`👤 Mock user already exists with ID: ${userId}`);
    }

    // 2. Seed Base Global Foods Library safely (Check if item exists before inserting)
    console.log('🍎 Seeding global foods dictionary...');
    const foodItems = [
      ['Chicken Breast', 165, 31.00, 0.00, 3.60, '100g'],
      ['White Rice', 130, 2.70, 28.00, 0.30, '100g'],
      ['Whole Egg', 70, 6.00, 0.60, 5.00, '1 piece'],
      ['Banana', 105, 1.30, 27.00, 0.40, '1 medium'],
      ['Whole Milk', 150, 8.00, 12.00, 8.00, '1 glass'],
      ['Oatmeal', 150, 5.00, 27.00, 2.50, '40g'],
      ['Salmon Fillet', 200, 22.00, 0.00, 13.00, '100g'],
      ['Avocado', 160, 2.00, 8.50, 15.00, '1 medium']
    ];

    const foodIds = [];
    for (const food of foodItems) {
      let foodCheck = await client.query('SELECT id FROM public.foods WHERE name = $1', [food[0]]);
      let foodId;
      
      if (foodCheck.rows.length === 0) {
        const res = await client.query(`
          INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, is_public)
          VALUES ($1, $2, $3, $4, $5, $6, true)
          RETURNING id
        `, food);
        foodId = res.rows[0].id;
      } else {
        foodId = foodCheck.rows[0].id;
      }
      foodIds.push({ id: foodId, name: food[0] });
    }

    // 3. Seed 7 Days of Historical Meal Logs
    console.log('📅 Seeding 7 days of historical meal logs...');
    const getFood = (name) => foodIds.find(f => f.name === name);

    for (let i = 0; i < 7; i++) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - i);
      const formattedDate = logDate.toISOString().split('T')[0];

      // Insert Breakfast Log
      const breakfastLog = await client.query(`
        INSERT INTO public.meal_logs (user_id, meal_type, log_date)
        VALUES ($1, 'Breakfast', $2) RETURNING id
      `, [userId, formattedDate]);
      
      const bLogId = breakfastLog.rows[0].id;
      await insertMealItem(client, bLogId, getFood('Whole Egg').id, 2, 140, 12.00, 1.20, 10.00);
      await insertMealItem(client, bLogId, getFood('Oatmeal').id, 1, 150, 5.00, 27.00, 2.50);

      // Insert Lunch Log
      const lunchLog = await client.query(`
        INSERT INTO public.meal_logs (user_id, meal_type, log_date)
        VALUES ($1, 'Lunch', $2) RETURNING id
      `, [userId, formattedDate]);
      
      const lLogId = lunchLog.rows[0].id;
      await insertMealItem(client, lLogId, getFood('Chicken Breast').id, 2, 330, 62.00, 0.00, 7.20);
      await insertMealItem(client, lLogId, getFood('White Rice').id, 2, 260, 5.40, 56.00, 0.60);
    }

    await client.query('COMMIT');
    console.log('🚀 Database successfully populated with synthetic data!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding:', error);
  } finally {
    client.release();
  }
}

async function insertMealItem(client, logId, foodId, quantity, cal, pro, carb, fat) {
  await client.query(`
    INSERT INTO public.meal_items (meal_log_id, food_id, quantity, custom_calories, custom_protein, custom_carbs, custom_fat)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [logId, foodId, quantity, cal, pro, carb, fat]);
}

seedDatabase();