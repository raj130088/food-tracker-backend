// src/ai/ai.controller.js
const aiService = require('./ai.service');
const mealService = require('../services/meal.service');
const analyticsService = require('../services/analytics.service');

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
      const user = req.user; // Captured from your cookie/auth middleware
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input. Please provide a valid natural language description string in the "message" field.' 
        });
      }

      // Step 1: Extract tracking matrices from text using local AI
      const extraction = await aiService.handleNaturalLogging(user, message);
      
      const { meal_type, items, notes } = extraction.data;

      // Step 2: Use your Phase 2 meal service to log this straight into the database
      // This automatically updates the user's meal history logs!
      const now = new Date();
      const currentTimeString = now.toTimeString().split(' ')[0];

      const savedMeal = await mealService.createMeal(user.id, {
        meal_type,
        items,
        notes: notes || null,
        time: currentTimeString // Injecting the current runtime clock execution
      });

      res.json({
        success: true,
        message: `Successfully logged your ${meal_type}!`,
        extracted: {
          meal_type,
          items
        },
        saved_meal: savedMeal
      });
    } catch (error) {
      console.error('AI Controller Logging Error:', error);
      res.status(500).json({ success: false, message: 'Error extracting and saving natural language food items' });
    }
  },

  async chatWithCoach(req, res) {
    try {
      const user = req.user; // Caught by your auth/cookie middleware
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Message is required.' });
      }

      // 1. Automatically fetch today's actual nutrition metrics using current date
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Adapt this call to whatever method names you verified in Phase 5
      const todaySummary = await analyticsService.getDailySummary(user.id, todayStr); 

      // DEBUG: See exactly how your summary service formats its response
      console.log("📊 Today Summary Object:", JSON.stringify(todaySummary, null, 2));

      // Safely extract the inner summary block whether it's nested or at the root level
      const activeSummary = todaySummary.summary ? todaySummary.summary : todaySummary;

      // 2. Generate data-grounded feedback using our AI Service
      const coachReply = await aiService.generateCoachResponse(user, activeSummary, message);

      res.json({
        success: true,
        data: {
          reply: coachReply,
          context_date: todayStr
        }
      });
    } catch (error) {
      console.error('AI Controller Coach Error:', error);
      res.status(500).json({ success: false, message: 'Error processing request with the coaching engine.' });
    }
  }
};

module.exports = aiController;