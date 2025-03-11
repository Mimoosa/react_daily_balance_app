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

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Activity report and points management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityPoints:
 *       type: object
 *       properties:
 *         Physical:
 *           type: number
 *         Cognitive:
 *           type: number
 *         Social:
 *           type: number
 *         Psychological:
 *           type: number
 */

/**
 * @swagger
 * /api/activityRepo/journal:
 *   get:
 *     summary: Get today's journal entry
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's journal entry with points
 *       404:
 *         description: No journal entry found for today
 *
 * /api/activityRepo/activity:
 *   post:
 *     summary: Generate activity response
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entry
 *             properties:
 *               entry:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated activity analysis
 *
 * /api/activityRepo/points:
 *   post:
 *     summary: Save activity points
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 $ref: '#/components/schemas/ActivityPoints'
 *     responses:
 *       200:
 *         description: Points saved successfully
 *
 * /api/activityRepo/weekly-points:
 *   get:
 *     summary: Get weekly activity points
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly points data
 *
 * /api/activityRepo/reset-processing:
 *   post:
 *     summary: Reset activity processing flag
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Processing flag reset successfully
 *       401:
 *         description: Unauthorized
 */

router.get('/journal', protect, getTodaysJournal);
router.post('/activity', protect, generateResponse);
router.post('/points', protect, saveActivityPoints);
router.get('/weekly-points', protect, getWeeklyPoints);
router.post('/reset-processing', protect, resetProcessingFlag);

module.exports = router;
