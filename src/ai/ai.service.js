const ollamaProvider = require('./providers/ollama.provider');
const promptBuilder = require('./prompt.builder');
const analyticsService = require('../services/analytics.service');

const aiService = {
  async handleNutritionQuery(user, userMessage) {
    const dailySummary = await analyticsService.getDailySummary(user.id);
    
    const prompt = promptBuilder.buildNutritionAnalysis(user, dailySummary, userMessage);
    
    const response = await ollamaProvider.chat(prompt);
    
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

      const aiResponse = await ollamaProvider.chat(systemPrompt, { temperature: 0.1 });
      
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
  }
};

module.exports = aiService;