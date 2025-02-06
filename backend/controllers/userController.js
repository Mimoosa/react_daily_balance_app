const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Creates a JWT token for user authentication
 * @param {string} _id - User's MongoDB _id
 * @returns {string} JWT token valid for 3 days
 */
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

/**
 * User Registration Controller
 * Validates input, checks for existing users, and creates new user
 * @param {Object} req - Express request object with username and password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const registerUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide both username and password'
        });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

        const user = await User.create({ username, password });
        const token = createToken(user._id);
        
        res.status(201).json({
            success: true,
            data: { username, token }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        next(error);
    }
};

/**
 * User Login Controller
 * Validates credentials and issues JWT token
 * @param {Object} req - Express request object with username and password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide both username and password'
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const match = await user.comparePassword(password);
        if (!match) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = createToken(user._id);
        res.status(200).json({
            success: true,
            data: { username, token }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};
