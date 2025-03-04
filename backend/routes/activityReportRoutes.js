const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getTodaysJournal, 
    generateResponse, 
    saveActivityPoints,
    getWeeklyPoints, 
    resetProcessingFlag
} = require('../controllers/activityReportController');

router.get('/journal', protect, getTodaysJournal);
router.post('/activity', protect, generateResponse);
router.post('/points', protect, saveActivityPoints);
router.get('/weekly-points', protect, getWeeklyPoints);
router.post('/reset-processing', protect, resetProcessingFlag);

module.exports = router;
