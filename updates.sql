-- Add personalization fields for AI
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS diet_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS allergies TEXT[],           -- array of strings
ADD COLUMN IF NOT EXISTS food_preferences TEXT[],
ADD COLUMN IF NOT EXISTS food_dislikes TEXT[];

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);