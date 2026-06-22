const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('./ai.controller');
const authMiddleware = require('../middleware/auth.middleware'); 

const aiLoggingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Limit each user to 5 natural language logs per minute
  message: {
    success: false,
    message: "Too many meal logging requests. Please slow down and try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI interactions must belong to an authenticated user context
router.post('/chat', authMiddleware, aiController.chatWithCoach);
router.post('/log-natural', authMiddleware, aiLoggingLimiter, aiController.logNaturalLanguage);
router.post('/chat-coach', authMiddleware, aiController.chatWithCoach);

module.exports = router;