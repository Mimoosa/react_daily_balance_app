const express = require('express');
const router = express.Router();
const { generateResponse } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard data and analytics
 */

/**
 * @swagger
 * /api/dashboard/getRecommendation:
 *   post:
 *     summary: Get personalized recommendations
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Physical:
 *                 type: number
 *               Psychological:
 *                 type: number
 *               Social:
 *                 type: number
 *               Cognitive:
 *                 type: number
 *     responses:
 *       200:
 *         description: Personalized recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                 advice:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

router.post('/getRecommendation', protect, generateResponse);

module.exports = router;