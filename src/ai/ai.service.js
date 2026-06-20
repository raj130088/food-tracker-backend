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

  async handleNaturalLogging(user, userMessage) {
    const prompt = promptBuilder.buildFoodLoggingPrompt(userMessage);
    const response = await ollamaProvider.chat(prompt);
    
    return {
      raw: response.content,
      // We will parse JSON in controller later
    };
  }
};

module.exports = aiService;