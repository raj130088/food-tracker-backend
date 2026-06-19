const { z } = require('zod');

const validationSchemas = {
  // Auth
  register: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required').optional(),
    age: z.number().positive().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string()
  }),

  // Meal Logging
  logMeal: z.object({
    meal_type: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
    log_date: z.string().optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      food_id: z.number().optional(),
      quantity: z.number().positive(),
      custom_calories: z.number().optional(),
      custom_protein: z.number().optional(),
      custom_carbs: z.number().optional(),
      custom_fat: z.number().optional(),
    })).min(1, 'At least one item is required')
  }),

  // Update Profile
  updateProfile: z.object({
    name: z.string().min(2).optional(),
    age: z.number().positive().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    daily_calorie_goal: z.number().positive().optional(),
    protein_goal: z.number().positive().optional(),
    carb_goal: z.number().positive().optional(),
    fat_goal: z.number().positive().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
};

module.exports = validationSchemas;