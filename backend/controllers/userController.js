const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
        res.status(400).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
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
        res.status(400).json({ error: 'Login failed' });
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
        const user = await User.findById(req.user.id).select('points');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ points: user.points });
    } catch (error) {
        console.error('Error fetching user points:', error);
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
        if (!user.points) {
            user.points = {};
        }
        
        // Add points to existing categories or create new ones
        for (const [category, value] of Object.entries(points)) {
            // Convert value to number if it's not already
            const pointValue = typeof value === 'number' ? value : parseInt(value, 10);
            
            if (!user.points[category]) {
                user.points[category] = 0;
            }
            
            user.points[category] += pointValue;
            
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserPoints,
    updateUserPoints, // Add this export
    deleteUser
};
