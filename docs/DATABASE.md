# Database Schema Documentation

## Overview

The Food Tracker application uses PostgreSQL as its primary database. The schema consists of five main tables that store user profiles, meal logs, food items, and weight tracking data. The schema is designed to efficiently store and retrieve nutritional tracking data while maintaining data integrity through foreign key constraints.

## Database Tables

### 1. Users Table

Stores user account information and profile data.

```sql
CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100),
    age integer,
    gender character varying(20),
    height numeric(5,2),
    weight numeric(5,2),
    activity_level character varying(50),
    daily_calorie_goal integer DEFAULT 2000,
    protein_goal numeric(6,2),
    carb_goal numeric(6,2),
    fat_goal numeric(6,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    diet_type character varying(50),
    allergies text[],
    food_preferences text[],
    food_dislikes text[]
);
```

**Columns:**
- `id`: Primary key, auto-incrementing integer
- `email`: Unique email address for user authentication
- `password_hash`: BCrypt hashed password
- `name`: User's display name
- `age`: User's age in years
- `gender`: User's gender ('Male', 'Female', 'Other')
- `height`: User's height in centimeters
- `weight`: User's weight in kilograms
- `activity_level`: User's activity level
- `daily_calorie_goal`: Target daily calorie intake
- `protein_goal`: Target daily protein intake
- `carb_goal`: Target daily carbohydrate intake
- `fat_goal`: Target daily fat intake
- `created_at`: Timestamp when user account was created
- `updated_at`: Timestamp when user profile was last updated
- `diet_type`: User's dietary preference (vegetarian, vegan, etc.)
- `allergies`: Array of food allergies
- `food_preferences`: Array of preferred foods
- `food_dislikes`: Array of disliked foods

**Constraints:**
- Primary key: `id`
- Unique constraint: `email`
- Indexes: `idx_users_email` on `email` column

### 2. Meal Logs Table

Stores individual meal entries with metadata.

```sql
CREATE TABLE public.meal_logs (
    id integer NOT NULL,
    user_id integer,
    meal_type character varying(50) NOT NULL,
    log_date date NOT NULL,
    "time" time without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT meal_logs_meal_type_check CHECK (((meal_type)::text = ANY ((ARRAY['Breakfast'::character varying, 'Lunch'::character varying, 'Dinner'::character varying, 'Snack'::character varying])::text[])))
);
```

**Columns:**
- `id`: Primary key, auto-incrementing integer
- `user_id`: Foreign key referencing `users.id`
- `meal_type`: Type of meal ('Breakfast', 'Lunch', 'Dinner', 'Snack')
- `log_date`: Date when meal was consumed
- `time`: Time when meal was consumed
- `notes`: Additional notes about the meal
- `created_at`: Timestamp when meal log was created

**Constraints:**
- Primary key: `id`
- Foreign key: `user_id` references `users(id)` with CASCADE delete
- Check constraint: `meal_type` must be one of the allowed values
- Indexes: `idx_meal_logs_user_date` on `user_id` and `log_date` columns

### 3. Foods Table

Stores food items with nutritional information.

```sql
CREATE TABLE public.foods (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    calories integer NOT NULL,
    protein numeric(6,2),
    carbs numeric(6,2),
    fat numeric(6,2),
    serving_size character varying(100),
    created_by integer,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, auto-incrementing integer
- `name`: Name of the food item
- `calories`: Caloric content per serving
- `protein`: Protein content in grams per serving
- `carbs`: Carbohydrate content in grams per serving
- `fat`: Fat content in grams per serving
- `serving_size`: Description of serving size
- `created_by`: Foreign key referencing `users.id` (NULL for public foods)
- `is_public`: Whether the food is publicly available
- `created_at`: Timestamp when food item was added

**Constraints:**
- Primary key: `id`
- Foreign key: `created_by` references `users(id)` (optional)
- Indexes: `idx_foods_name` on `name` column

### 4. Meal Items Table

Stores individual food items within meal logs.

```sql
CREATE TABLE public.meal_items (
    id integer NOT NULL,
    meal_log_id integer,
    food_id integer,
    quantity numeric(8,2) NOT NULL,
    custom_calories integer,
    custom_protein numeric(6,2),
    custom_carbs numeric(6,2),
    custom_fat numeric(6,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, auto-incrementing integer
- `meal_log_id`: Foreign key referencing `meal_logs.id`
- `food_id`: Foreign key referencing `foods.id`
- `quantity`: Quantity of food consumed
- `custom_calories`: Custom calorie value (overrides food default)
- `custom_protein`: Custom protein value (overrides food default)
- `custom_carbs`: Custom carbohydrate value (overrides food default)
- `custom_fat`: Custom fat value (overrides food default)
- `created_at`: Timestamp when meal item was added

**Constraints:**
- Primary key: `id`
- Foreign key: `meal_log_id` references `meal_logs(id)` with CASCADE delete
- Foreign key: `food_id` references `foods(id)`

### 5. Weight Logs Table

Stores user weight tracking over time.

```sql
CREATE TABLE public.weight_logs (
    id integer NOT NULL,
    user_id integer,
    log_date date NOT NULL,
    weight numeric(5,2) NOT NULL
);
```

**Columns:**
- `id`: Primary key, auto-incrementing integer
- `user_id`: Foreign key referencing `users.id`
- `log_date`: Date when weight was recorded
- `weight`: User's weight in kilograms

**Constraints:**
- Primary key: `id`
- Foreign key: `user_id` references `users(id)` with CASCADE delete
- Unique constraint: Combination of `user_id` and `log_date`
- Indexes: None (relatively small table)

## Table Relationships

```
users (1) ←→ (N) meal_logs
users (1) ←→ (N) weight_logs
users (1) ←→ (N) foods (created_by - optional)
meal_logs (1) ←→ (N) meal_items
foods (1) ←→ (N) meal_items
```

## Indexes

The following indexes have been created to optimize query performance:

1. `idx_users_email` on `users.email` - For fast user lookup during authentication
2. `idx_meal_logs_user_date` on `meal_logs(user_id, log_date)` - For retrieving meals by user and date
3. `idx_foods_name` on `foods.name` - For fast food search operations

## Migrations

The following schema changes have been applied through `updates.sql`:

```sql
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
```

## Data Types

- `integer`: Standard integer values
- `character varying(n)`: Variable-length strings with maximum length n
- `text`: Unlimited length text
- `numeric(p,s)`: Decimal numbers with p digits total and s decimal places
- `date`: Date values (YYYY-MM-DD)
- `time`: Time values (HH:MM:SS)
- `timestamp`: Date and time values
- `boolean`: True/false values
- `text[]`: Arrays of text values

## Constraints

- Primary keys ensure unique identification of records
- Foreign keys maintain referential integrity between related tables
- Check constraints validate data values (e.g., meal_type validation)
- Unique constraints prevent duplicate values (e.g., email addresses)
- Not-null constraints ensure required fields are populated
- Default values provide sensible defaults for new records

## Sequences

Each table with an auto-incrementing primary key has an associated sequence:

- `users_id_seq`: For generating `users.id` values
- `meal_logs_id_seq`: For generating `meal_logs.id` values
- `foods_id_seq`: For generating `foods.id` values
- `meal_items_id_seq`: For generating `meal_items.id` values
- `weight_logs_id_seq`: For generating `weight_logs.id` values

## Extensions

The database uses the `uuid-ossp` extension for generating universally unique identifiers, though it's not currently used in the schema.