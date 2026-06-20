const express = require('express');
const router = express.Router();
const AIService = require('../ai/ai.service');

// 1. IMPORT YOUR EXISTING AUTH MIDDLEWARE HERE
// (Change this path to wherever your actual auth middleware lives)
const verifyAuth = require('../middleware/auth.middleware'); 

/**
 * POST /api/ai/log-meal
 * Now fully protected by your actual cookie validation layer
 */
router.post('/log-meal', verifyAuth, async (req, res) => {
  try {
    const { message, mealType } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message field is required' });
    }

    // req.user.id will now be populated safely by your real cookie decoder
    const logResult = await AIService.logMealFromNaturalLanguage(req.user.id, message, mealType);
    return res.status(201).json({
      success: true,
      message: 'Meal parsed and logged successfully',
      data: logResult
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/coach
 */
router.get('/coach', verifyAuth, async (req, res) => {
  try {
    const coachingFeedback = await AIService.getNutritionCoaching(req.user.id);
    return res.status(200).json({
      success: true,
      feedback: coachingFeedback
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;