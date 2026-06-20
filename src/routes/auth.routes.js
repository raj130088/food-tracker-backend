const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();
const validate = require('../middleware/validate.middleware');

router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/logout', authController.logout);

module.exports = router;