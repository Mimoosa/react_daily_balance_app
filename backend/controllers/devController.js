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
    console.log(`[DEBUG] Dev Reset - Deleted all journals for user ${userId}`);

    // Reset both points and totalPoints to default values
    const defaultPoints = {
      Physical: 100,
      Cognitive: 100,
      Social: 100,
      Psychological: 100
    };

    // Use updateOne to ensure atomic update
    const updateResult = await User.updateOne(
      { _id: userId },
      { 
        $set: { 
          points: defaultPoints,
          totalPoints: defaultPoints  // Make sure totalPoints is also reset
        } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to update user points');
    }

    // Fetch updated user data to confirm changes
    const updatedUser = await User.findById(userId);
    console.log('[DEBUG] Dev Reset - Reset points for user:', {
      userId,
      points: updatedUser.points,
      totalPoints: updatedUser.totalPoints
    });

    res.json({ 
      success: true, 
      message: 'User data reset successfully',
      points: updatedUser.points,
      totalPoints: updatedUser.totalPoints
    });
  } catch (error) {
    console.error('[ERROR] Dev Reset:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Debug and repair user points
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const debugUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pointsStatus = {
      before: {
        points: user.points || {},
        totalPoints: user.totalPoints || {}
      }
    };

    // Make sure both points objects exist
    if (!user.points) {
      user.points = {
        Physical: 100,
        Cognitive: 100,
        Social: 100,
        Psychological: 100
      };
    }

    if (!user.totalPoints) {
      user.totalPoints = { ...user.points };
    }
    
    // Make sure all required categories exist in totalPoints
    const requiredCategories = ['Physical', 'Cognitive', 'Social', 'Psychological'];
    let updated = false;
    
    for (const category of requiredCategories) {
      // If the category doesn't exist in totalPoints, copy from points or set default
      if (user.totalPoints[category] === undefined) {
        user.totalPoints[category] = user.points[category] !== undefined ? 
          user.points[category] : 100;
        updated = true;
      }
    }

    if (updated) {
      await User.updateOne(
        { _id: userId },
        { 
          $set: { 
            totalPoints: user.totalPoints,
            points: user.points 
          } 
        }
      );

      pointsStatus.after = {
        points: user.points,
        totalPoints: user.totalPoints
      };
      pointsStatus.updated = true;
    } else {
      pointsStatus.after = pointsStatus.before;
      pointsStatus.updated = false;
    }

    res.json({ 
      success: true,
      message: updated ? 'Points structure repaired' : 'No repairs needed',
      pointsStatus
    });
  } catch (error) {
    console.error('Error in debug points:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  resetUserData,
  debugUserPoints
};
