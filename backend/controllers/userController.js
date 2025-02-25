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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserPoints
};
