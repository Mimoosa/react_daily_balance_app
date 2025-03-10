const express = require('express');
const router = express.Router();
const { generateResponse, getWeeklyPoints, updateWeeklyPoints } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.post('/getRecommendation', protect, generateResponse);
router.get('/weekly-points', protect, getWeeklyPoints);
router.put('/weekly-points', protect, updateWeeklyPoints);

module.exports = router;