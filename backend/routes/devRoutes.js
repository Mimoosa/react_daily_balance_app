const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { resetUserData, debugUserPoints } = require('../controllers/devController');

// Dev routes - all protected
router.post('/reset-user-data', protect, resetUserData);
router.post('/debug-points', protect, debugUserPoints);

module.exports = router;
