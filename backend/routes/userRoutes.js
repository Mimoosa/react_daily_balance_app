const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserPoints, 
    deleteUser,
    getPointsDebug,
    updateUserPoints,
    getUserStreak,
    getUserInfo,
    updateUserInfo,
    getFriendDashboard
} = require('../controllers/userController');
const { 
    createJournal, 
    getJournals, 
    updateJournal 
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: 
 *                       type: string
 *                     username:
 *                       type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid input
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

router.get('/profile', protect, getUserInfo);
router.put('/profile', protect, updateUserInfo);  // Changed from updateUserPoints to updateUserInfo
router.delete('/profile', protect, deleteUser);

/**
 * @swagger
 * tags:
 *   name: Journal
 *   description: Journal management endpoints
 */

/**
 * @swagger
 * /api/users/journal:
 *   post:
 *     summary: Create a new journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The journal entry content
 *     responses:
 *       201:
 *         description: Journal entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Journal'
 *       400:
 *         description: Invalid input or journal entry for today already exists
 *
 *   get:
 *     summary: Get user's journal entries
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Journal'
 * 
 * /api/users/journal/{id}:
 *   put:
 *     summary: Update a journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Journal entry updated successfully
 *       404:
 *         description: Journal entry not found
 */
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

// Add this new route
router.get('/friends/:friendId/dashboard', protect, getFriendDashboard);

module.exports = router;
