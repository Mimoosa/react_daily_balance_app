const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/verify', authMiddleware, async (req, res) => {
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