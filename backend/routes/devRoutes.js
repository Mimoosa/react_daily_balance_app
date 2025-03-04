const express = require('express');
const router = express.Router();
const { resetUserData } = require('../controllers/devController');
const { protect } = require('../middleware/auth');

// Reset user data (journals and points) for testing
router.post('/reset-user-data', protect, resetUserData);

module.exports = router;
