const express = require('express');
const router = express.Router();
const { getTodaysJournal, generateResponse } = require('../controllers/activityReportController');
const { protect } = require('../middleware/auth');


router.get('/journal', protect, getTodaysJournal);
router.post('/activity', protect, generateResponse)

module.exports = router;
