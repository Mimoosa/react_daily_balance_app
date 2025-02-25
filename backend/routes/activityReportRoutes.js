const express = require('express');
const router = express.Router();
const { getTodaysJournal, generateResponse, getWeeklyPoints, saveActivityPoints  } = require('../controllers/activityReportController');
const { protect } = require('../middleware/auth');


router.get('/journal', protect, getTodaysJournal);
router.post('/activity', protect, generateResponse);
router.post('/points', protect, saveActivityPoints);
router.get('/weekly', protect, getWeeklyPoints);

module.exports = router;
