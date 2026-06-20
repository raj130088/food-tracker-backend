const promptBuilder = {
  buildNutritionAnalysis(user, dailySummary, userMessage) {
    return `
You are a helpful nutrition coach.

User Profile:
- Name: ${user.name || 'User'}
- Daily Calorie Goal: ${user.daily_calorie_goal}
- Diet Type: ${user.diet_type || 'None'}
- Allergies: ${user.allergies ? user.allergies.join(', ') : 'None'}

Today's Summary:
- Calories consumed: ${dailySummary.total_calories}
- Remaining: ${user.daily_calorie_goal - dailySummary.total_calories}

User Question: ${userMessage}

Give a short, friendly, and actionable response.
`;
  },

  buildFoodLoggingPrompt(userMessage) {
    return `
Extract food items from this message and return structured data.

Message: "${userMessage}"

Return only valid JSON in this format:
{
  "foods": [
    {
      "name": "banana",
      "quantity": 2,
      "unit": "piece"
    }
  ],
  "meal_type": "Snack"
}
`;
  }
};

module.exports = promptBuilder;