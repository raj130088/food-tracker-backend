const ollamaProvider = require('./providers/ollama.provider');
const groqProvider = require('./providers/groq.provider');
const promptBuilder = require('./prompt.builder');
const analyticsService = require('../services/analytics.service');

const aiService = {
  async handleNutritionQuery(user, userMessage) {
    const dailySummary = await analyticsService.getDailySummary(user.id);
    
    const prompt = promptBuilder.buildNutritionAnalysis(user, dailySummary, userMessage);
    
    const response = await groqProvider.chat(prompt);
    
    return {
      reply: response.content,
      metadata: {
        calories_consumed: dailySummary.total_calories
      }
    };
  },

  async handleNaturalLogging(user, message) {
    try {
      // A precise system prompt that binds the local LLM to a strict output layout
      const systemPrompt = `
You are a precise nutrition extraction engine. Your job is to parse a user's natural language meal description and extract structured data.

CRITICAL: You must respond ONLY with a raw valid JSON object. Do not include markdown formatting, no backticks (\`\`\`json), no conversational filler. Always convert textual numbers (e.g., 'two', 'half', 'a quarter') into literal decimal floats (e.g., 2.0, 0.5, 0.25).

The JSON object must strictly match this schema:
{
  "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
  "notes": "Any extra text details, descriptions, or context the user mentioned about the meal, or null if none",
  "items": [
    {
      "name": "name of the food item in lowercase",
      "quantity": numerical multiplier float value (e.g., 1.5, 2, 0.5)
    }
  ]
}

If no meal type is specified, infer it logically based on typical times or default to "Snack".

User input: "${message}"
`;

      const aiResponse = await groqProvider.chat(systemPrompt, { temperature: 0.1 });
      
      // Clean up any accidental formatting lines the LLM might have left behind
      let cleanText = aiResponse.content.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json|```$/g, '').trim();
      }

      console.log("🤖 Raw Extraction from LLM:", cleanText);

      // Parse text into a live JavaScript object
      const structuredData = JSON.parse(cleanText);
      return {
        success: true,
        data: structuredData
      };
    } catch (error) {
      console.error('AI Service Logging Extraction Error:', error);
      throw new Error('Failed to parse food items using the local AI engine');
    }
  },

  async generateCoachResponse(user, summary, userMessage) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const s = summary || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 };

      // Build a rich, data-dense system prompt grounding the LLM in real-time metrics
      const systemPrompt = `
You are an expert personal AI Nutrition Coach and Sports Dietitian. Your tone is supportive, analytical, direct, and motivating.

Here is the ground-truth profile data for the authenticated user you are speaking with:
- Name: ${user.name || 'User'}
- Diet Type: ${user.diet_type || 'None'}
- Allergies: ${user.allergies ? user.allergies.join(', ') : 'None'}
- Dislikes: ${user.food_dislikes ? user.food_dislikes.join(', ') : 'None'}
- Daily Calorie Goal: ${user.daily_calorie_goal} kcal
- Target Macros: Protein: ${user.protein_goal || 'N/A'}g, Carbs: ${user.carb_goal || 'N/A'}g, Fat: ${user.fat_goal || 'N/A'}g

Here is the user's actual intake metrics for today (${todayStr}):
- Calories Consumed: ${s.total_calories} kcal
- Protein Consumed: ${s.total_protein}g
- Carbs Consumed: ${s.total_carbs}g
- Fat Consumed: ${s.total_fat}g
- Total Meals Logged: ${s.meal_count}

Analyze their intake metrics against their profile goals. Respond to the user's message below directly. Keep your advice practical, actionable, and reference their specific targets or logs if relevant. Do not hallucinate data.

User message: "${userMessage}"
`;

      const aiResponse = await groqProvider.chat(systemPrompt, { temperature: 0.3 });
      return aiResponse.content.trim();
    } catch (error) {
      console.error('AI Service Coach Response Error:', error);
      throw new Error('Failed to generate response from the AI coaching engine.');
    }
  }
};

module.exports = aiService;