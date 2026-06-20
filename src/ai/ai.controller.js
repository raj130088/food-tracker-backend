// src/ai/ai.controller.js
const aiService = require('./ai.service');

const aiController = {
  // POST /api/ai/chat
  async chatWithCoach(req, res) {
    try {
      const user = req.user; // Set by your authMiddleware
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      const analysis = await aiService.handleNutritionQuery(user, message);

      res.json({
        success: true,
        reply: analysis.reply,
        metadata: analysis.metadata
      });
    } catch (error) {
      console.error('AI Controller Chat Error:', error);
      res.status(500).json({ success: false, message: 'Error processing AI chat query' });
    }
  },

  // POST /api/ai/log-natural
  async logNaturalLanguage(req, res) {
    try {
      const user = req.user;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Natural language text description is required' });
      }

      const extraction = await aiService.handleNaturalLogging(user, message);

      // In Phase 6, we will write a strict JSON parser here to take this raw extraction
      // and pipe it directly into mealService.createMeal(). For now, we return it to verify the LLM.
      res.json({
        success: true,
        extracted_data: extraction.raw
      });
    } catch (error) {
      console.error('AI Controller Logging Error:', error);
      res.status(500).json({ success: false, message: 'Error extracting natural language food items' });
    }
  }
};

module.exports = aiController;