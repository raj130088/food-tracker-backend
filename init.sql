-- Enable UUID extension (optional but useful)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    age INTEGER,
    gender VARCHAR(20),
    height DECIMAL(5,2),           -- in cm
    weight DECIMAL(5,2),           -- in kg
    activity_level VARCHAR(50),
    daily_calorie_goal INTEGER DEFAULT 2000,
    protein_goal DECIMAL(6,2),
    carb_goal DECIMAL(6,2),
    fat_goal DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foods Table (global + user custom foods)
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(6,2),
    carbs DECIMAL(6,2),
    fat DECIMAL(6,2),
    serving_size VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Logs
CREATE TABLE IF NOT EXISTS meal_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    log_date DATE NOT NULL,
    time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Items (what was actually eaten)
CREATE TABLE IF NOT EXISTS meal_items (
    id SERIAL PRIMARY KEY,
    meal_log_id INTEGER REFERENCES meal_logs(id) ON DELETE CASCADE,
    food_id INTEGER REFERENCES foods(id),
    quantity DECIMAL(8,2) NOT NULL,
    custom_calories INTEGER,
    custom_protein DECIMAL(6,2),
    custom_carbs DECIMAL(6,2),
    custom_fat DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Weight tracking
CREATE TABLE IF NOT EXISTS weight_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    UNIQUE(user_id, log_date)
);

-- Indexes for better performance
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, log_date);
CREATE INDEX idx_foods_name ON foods(name);

COMMENT ON TABLE users IS 'User profiles and goals';
COMMENT ON TABLE meal_logs IS 'Daily meal entries';

-- Insert some sample public foods (optional but helpful for testing)
INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, is_public)
VALUES 
    ('Chicken Breast', 165, 31, 0, 3.6, '100g', true),
    ('White Rice', 130, 2.7, 28, 0.3, '100g cooked', true),
    ('Banana', 89, 1.1, 23, 0.3, '1 medium', true),
    ('Egg', 78, 6.3, 0.6, 5.3, '1 large', true)
ON CONFLICT DO NOTHING;