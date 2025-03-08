const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Get user's points with detailed logging
 * @route GET /api/users/points-debug
 * @access Private
 */
const getPointsDebug = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('[DEBUG] getPointsDebug - Fetching points for user:', userId);

        const user = await User.findById(userId);
        
        if (!user) {
            console.log('[DEBUG] getPointsDebug - User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if points exist, if not initialize with default values
        if (!user.points) {
            console.log('[DEBUG] getPointsDebug - No points found in user.points, initializing defaults');
            user.points = {
                Physical: 100,
                Psychological: 100,
                Social: 100,
                Cognitive: 100
            };
            await user.save();
        }

        // Log both user.points and user.totalPoints for comparison
        console.log('[DEBUG] getPointsDebug - User points structure:', {
            points: user.points || 'Not set',
            totalPoints: user.totalPoints || 'Not set'
        });

        // Return both points structures for debugging
        res.json({
            points: user.points || {
                Physical: 100,
                Psychological: 100,
                Social: 100,
                Cognitive: 100
            },
            totalPoints: user.totalPoints || {
                Physical: 100,
                Psychological: 100,
                Social: 100,
                Cognitive: 100
            },
            message: "Both points structures returned for debugging"
        });
    } catch (error) {
        console.error('[ERROR] getPointsDebug:', error);
        res.status(400).json({ error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        res.status(201).json({
            data: { 
                id: user._id,
                username: user.username,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate that both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Special handling for users without password (migration issue)
        if (!user.password) {
            console.error(`User ${user._id} (${username}) has no password field - setting temporary password`);
            
            // Set a new temporary password for this user
            user.password = password; // Will be hashed by pre-save hook in model
            await user.save();
            console.log(`Temporary password set for user ${username}`);
            
            // Return success response with token
            return res.json({
                data: {
                    id: user._id,
                    username: user.username,
                    token: generateToken(user._id),
                    passwordUpdated: true
                }
            });
        }

        const isMatch = await user.matchPassword(password);
        
        if (isMatch) {
            res.json({
                data: {
                    id: user._id,
                    username: user.username,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message || 'Login failed' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        // Optional: Delete any related data like activities, etc.
        // await Activity.deleteMany({ user: req.user.id });
        
        await user.deleteOne();
        res.json({ message: 'User account deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}
/**
 * Get user's accumulated points
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getUserPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if we should use totalPoints or points
        let pointsToReturn;
        
        if (user.totalPoints && Object.keys(user.totalPoints).length > 0) {
            pointsToReturn = user.totalPoints;
        } else if (user.points && Object.keys(user.points).length > 0) {
            pointsToReturn = user.points;
        } else {
            pointsToReturn = {
                Physical: 100,
                Psychological: 100,
                Social: 100,
                Cognitive: 100
            };
        }

        res.json({ points: pointsToReturn });
    } catch (error) {
        console.error('[ERROR] getUserPoints:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Update user's accumulated points
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.points - Points to add to user's totals by category
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateUserPoints = async (req, res) => {
    try {
        const { points } = req.body;
        
        if (!points || typeof points !== 'object') {
            return res.status(400).json({ error: 'Valid points object is required' });
        }
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Initialize points object if it doesn't exist
        if (!user.totalPoints) {
            user.totalPoints = {};
        }
        
        // Add points to existing categories or create new ones
        for (const [category, value] of Object.entries(points)) {
            // Convert value to number if it's not already
            const pointValue = typeof value === 'number' ? value : parseInt(value, 10);
            
            if (!user.totalPoints[category]) {
                user.totalPoints[category] = 0;
            }
            
            user.totalPoints[category] += pointValue;
            
            // Prevent negative values if needed 
            // (uncomment if you want to ensure points never go below zero)
            // if (user.points[category] < 0) {
            //     user.points[category] = 0;
            // }
        }
        
        await user.save();
        
        res.json({ 
            points: user.points,
            updated: true
        });
    } catch (error) {
        console.error('Error updating user points:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update this function to preserve points data when updating journal entries
const updateJournalEntry = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const Journal = require('../models/Journal'); // Ensure Journal model is imported
    
    // Find the existing entry to check its status and preserve points
    const existingEntry = await Journal.findOne({ 
      _id: req.params.id, 
      user: userId 
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Store existing points and activities data
    const existingPoints = existingEntry.points || null;
    const existingActivities = existingEntry.activities || null;
    
    // Check if this is today's entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(existingEntry.date);
    entryDate.setHours(0, 0, 0, 0);
    const isToday = entryDate.getTime() === today.getTime();
    
    console.log("[DEBUG] updateJournalEntry - Journal entry details:", {
      id: existingEntry._id,
      isToday,
      hasPoints: Boolean(existingPoints),
      pointsData: existingPoints
    });
    
    // For today's entry, we'll reset activitiesProcessed when content changes
    // but preserve the points data in the document for proper resetting later
    const updateData = {
      content: content,
      points: existingPoints, // Preserve points data
      activities: existingActivities // Preserve activities data
    };
    
    // Only reset processed flag for today's entry, preserving points data for reference
    if (isToday) {
      // Set activitiesProcessed to false but keep points data
      updateData.activitiesProcessed = false;
    }
    
    // Update the entry
    const updatedEntry = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updateData,
      { new: true }
    );
    
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('[ERROR] updateJournalEntry:', error);
    res.status(400).json({ error: error.message });
  }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * Updates a user's streak when they add a journal entry
 * @async
 * @function
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Updated streak information
 */
const updateUserStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Initialize streak data if it doesn't exist
        if (!user.streak) {
            user.streak = {
                count: 0,
                lastEntryDate: null,
                bestStreak: 0
            };
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Beginning of today
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1); // Beginning of yesterday
        
        // Get the last entry date (normalize to start of the day)
        let lastEntryDate = null;
        if (user.streak.lastEntryDate) {
            lastEntryDate = new Date(user.streak.lastEntryDate);
            lastEntryDate.setHours(0, 0, 0, 0);
        }
        
        // If this is the first entry ever or if it's been more than one day since the last entry
        if (!lastEntryDate) {
            // First entry ever
            user.streak.count = 1;
            user.streak.lastEntryDate = today;
        } 
        else if (lastEntryDate.getTime() === today.getTime()) {
            // Already recorded today, no change to streak
        }
        else if (lastEntryDate.getTime() === yesterday.getTime()) {
            // Consecutive day
            user.streak.count += 1;
            user.streak.lastEntryDate = today;
        } 
        else {
            // Streak broken, start over
            user.streak.count = 1;
            user.streak.lastEntryDate = today;
        }
        
        // Update best streak if current streak is better
        if (user.streak.count > user.streak.bestStreak) {
            user.streak.bestStreak = user.streak.count;
        }
        
        await user.save();
        
        return {
            currentStreak: user.streak.count,
            bestStreak: user.streak.bestStreak,
            lastEntry: user.streak.lastEntryDate
        };
    } catch (error) {
        console.error('[ERROR] updateUserStreak:', error);
        throw error;
    }
};

/**
 * Gets user's current streak information
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 */
const getUserStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // If user has no streak data yet, initialize with defaults
        const streakData = user.streak || {
            count: 0,
            lastEntryDate: null,
            bestStreak: 0
        };
        
        res.json({
            currentStreak: streakData.count,
            bestStreak: streakData.bestStreak,
            lastEntryDate: streakData.lastEntryDate
        });
    } catch (error) {
        console.error('[ERROR] getUserStreak:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserPoints,
    updateUserPoints, // Add this export
    deleteUser,
    getPointsDebug,
    updateJournalEntry,
    getUserStreak,
    updateUserStreak  // Export for potential use elsewhere
};
