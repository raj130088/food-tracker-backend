const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const router = express.Router();

router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, validate('updateProfile'), userController.updateProfile);

module.exports = router;