const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserPoints, 
    updateUserPoints, // This function is likely undefined
    deleteUser
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
// This is the problematic line - updateUserPoints is likely undefined
router.post('/update-points', protect, updateUserPoints); 

module.exports = router;
