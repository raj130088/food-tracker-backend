const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authMiddleware = require('../middleware/auth.middleware'); 

// All AI interactions must belong to an authenticated user context
router.post('/chat', authMiddleware, aiController.chatWithCoach);
router.post('/log-natural', authMiddleware, aiController.logNaturalLanguage);

module.exports = router;