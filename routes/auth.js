const express = require('express');
const router = express.Router();
const { loginLimiter } = require('../middleware/rateLimmiter');
const authController = require('../controllers/authController');

router.post('/', loginLimiter, authController);

module.exports = router;