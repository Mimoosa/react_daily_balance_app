const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify user's JWT token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid token or user not found
 */

router.get('/verify', protect, async (req, res) => {
  try {
    // Make sure req.user is being set by your auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Send back the user data
    res.json({ 
      user: req.user,
      message: 'Token verified successfully' 
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 