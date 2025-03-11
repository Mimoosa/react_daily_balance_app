const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { resetUserData, debugUserPoints } = require('../controllers/devController');

/**
 * @swagger
 * tags:
 *   name: Development
 *   description: Development and debugging endpoints
 */

/**
 * @swagger
 * /api/dev/reset-user-data:
 *   post:
 *     summary: Reset user data (Development only)
 *     tags: [Development]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data reset successfully
 *       401:
 *         description: Unauthorized
 *
 * /api/dev/debug-points:
 *   post:
 *     summary: Debug user points (Development only)
 *     tags: [Development]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points debug information
 *       401:
 *         description: Unauthorized
 */

// Dev routes - all protected
router.post('/reset-user-data', protect, resetUserData);
router.post('/debug-points', protect, debugUserPoints);

module.exports = router;
