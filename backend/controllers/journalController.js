/**
 * @fileoverview Controller for handling journal operations with AI analysis integration
 * @module controllers/journalController
 */

const Journal = require('../models/Journal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initialize Gemini AI model for journal analysis
 * @constant {GoogleGenerativeAI}
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // API key from environment
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" }); // Use Gemini Pro model ???

/**
 * Analyzes journal content using Gemini AI
 * @async
 * @function
 * @param {string} content - The journal entry content to analyze
 * @returns {Promise<Object>} Analysis result containing mood, summary, and suggestions
 * @throws {Error} If AI analysis fails
 */
const analyzeJournalEntry = async (content) => {
    const prompt = `
    Analyze this journal entry and provide a response in the following JSON format without any markdown formatting or code blocks:
    {
        "mood": "brief 1-2 word mood description",
        "summary": "2-3 sentence summary of the entry",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
    }

    Make the analysis empathetic and constructive. Here's the journal entry:
    ${content}`;

    try {
        const result = await model.generateContent(prompt);
        let analysisText = result.response.text();
        
        // Puhdista vastaus mahdollisista markdown-merkinnöistä
        // Poista ```json ja ``` merkinnät
        analysisText = analysisText.replace(/```json|```/g, '').trim();
        
        // Etsi ensimmäinen { merkki ja viimeinen } merkki
        const startIndex = analysisText.indexOf('{');
        const endIndex = analysisText.lastIndexOf('}');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            // Ota vain JSON-osa vastauksesta
            analysisText = analysisText.substring(startIndex, endIndex + 1);
        }
        
        return JSON.parse(analysisText);
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to analyze journal entry');
    }
};

/**
 * Creates a new journal entry with AI analysis
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.content - Journal entry content
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If creation fails or daily entry exists
 */
const createJournal = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;

        // Check for existing entry today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingEntry = await Journal.findOne({
            user: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (existingEntry) {
            return res.status(400).json({ error: 'Journal entry for today already exists' });
        }

        // Get AI analysis
        const analysis = await analyzeJournalEntry(content);
        
        // Create new journal entry with analysis
        const journal = new Journal({
            user: userId,
            content,
            analysis: {
                ...analysis,
                timestamp: new Date()
            },
            date: new Date()
        });

        await journal.save();
        
        // Send back the journal with analysis
        res.status(201).json({
            _id: journal._id,
            content: journal.content,
            analysis: journal.analysis,
            date: journal.date
        });

    } catch (error) {
        console.error('Journal Creation Error:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to create journal entry' 
        });
    }
};

/**
 * Retrieves user's journal entries
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If fetching fails
 */
const getJournals = async (req, res) => {
    try {
        const journals = await Journal.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(10);
        res.json(journals);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Updates an existing journal entry
 * Only allows updating today's entry
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Journal entry ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.content - Updated journal content
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If update fails or entry is not from today
 */
const updateJournal = async (req, res) => {
    try {
        const { content } = req.body;
        const journal = await Journal.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        // Only allow updating today's entry
        const today = new Date();
        const entryDate = new Date(journal.date);
        if (today.toDateString() !== entryDate.toDateString()) {
            return res.status(400).json({ error: 'Only today\'s entry can be updated' });
        }

        // Get new AI analysis
        const analysis = await analyzeJournalEntry(content);
        
        /**
         * FEATURE: Reset points when journal content is updated
         * 
         * When a user updates their journal entry, we need to reset the points
         * so that they can be recalculated based on the new content.
         * This ensures that the points accurately reflect the updated journal content.
         * 
         * The points will be recalculated when the user visits the activity report page.
         * The activityReportController.saveActivityPoints function will handle
         * subtracting old points and adding new points to the user's total.
         */
        if (journal.points && Object.keys(journal.points).length > 0) {
            // Reset points to trigger a new calculation
            journal.points = {};
            // Also clear any activities that were previously calculated
            journal.activities = undefined;
        }
        
        journal.content = content;
        journal.analysis = {
            ...analysis,
            timestamp: new Date()
        };

        await journal.save();
        
        res.json(journal);
    } catch (error) {
        console.error('Journal Update Error:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Checks if a given date is today
 * @function
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today, false otherwise
 */
const isToday = (date) => {
    const today = new Date();
    const entryDate = new Date(date);
    return today.toDateString() === entryDate.toDateString();
};

module.exports = {
    createJournal,
    getJournals,
    updateJournal
};
