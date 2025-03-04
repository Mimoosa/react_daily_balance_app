const User = require('../models/User');
const Journal = require('../models/Journal');

/**
 * Reset user data for development/testing purposes
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const resetUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all journals for the user
    await Journal.deleteMany({ user: userId });
    console.log(`Deleted all journals for user ${userId}`);

    // Reset points to default values
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set default points
    user.points = {
      Physical: 100,
      Cognitive: 100,
      Social: 100,
      Psychological: 100
    };

    await user.save();
    console.log(`Reset points for user ${userId}`);

    res.json({ 
      success: true, 
      message: 'User data reset successfully',
      points: user.points 
    });
  } catch (error) {
    console.error('Error in dev reset:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  resetUserData
};
