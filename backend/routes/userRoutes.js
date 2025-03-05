const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserPoints, 
    deleteUser,
    getPointsDebug,
    updateUserPoints,
    getUserStreak  // Added getUserStreak function
} = require('../controllers/userController');
const { 
    createJournal, 
    getJournals, 
    updateJournal 
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/profile', protect, deleteUser);

// Journal routes - protected by auth middleware
router.post('/journal', protect, createJournal);
router.put('/journal/:id', protect, updateJournal);
router.get('/journals', protect, getJournals);

// User data routes
router.get('/points', protect, getUserPoints);
router.post('/update-points', protect, updateUserPoints); // Fixed: use the correct function name

// Debug route - only for development
router.get('/points-debug', protect, getPointsDebug);

// Streak route
router.get('/streak', protect, getUserStreak);

module.exports = router;
