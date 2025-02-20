const express = require('express');
const router = express.Router();
const { generateResponse } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.post('/getRecommendation', generateResponse);

module.exports = router;