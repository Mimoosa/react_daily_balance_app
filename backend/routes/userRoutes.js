const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserPoints } = require('../controllers/userController');
const { createJournal, getJournals, updateJournal } = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Journal routes - protected by auth middleware
router.post('/journal', protect, createJournal);
router.put('/journal/:id', protect, updateJournal);
router.get('/journals', protect, getJournals);

// User data routes
router.get('/points', protect, getUserPoints);

module.exports = router;
