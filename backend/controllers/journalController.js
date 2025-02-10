const Journal = require('../models/Journal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const analyzeJournalEntry = async (content) => {
    const prompt = `
    Analyze this journal entry and provide a response in the following JSON format:
    {
        "mood": "brief 1-2 word mood description",
        "summary": "2-3 sentence summary of the entry",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
    }

    Make the analysis empathetic and constructive. Here's the journal entry:
    ${content}`;

    try {
        const result = await model.generateContent(prompt);
        const analysisText = result.response.text();
        return JSON.parse(analysisText);
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to analyze journal entry');
    }
};

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
