const Journal = require('../models/Journal');
const ActivityPoints = require('../models/ActivityPoints');
const User = require('../models/User');

const model = require("../models/geminiModel");

const getTodaysJournal = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysJournal = await Journal.findOne({
            user: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            } 
        });
        
        if (!todaysJournal) {
            return res.status(404).json({ error: "Today's journal entry not found" });
        }

        const pointsData = todaysJournal.points && typeof todaysJournal.points === 'object' 
            ? todaysJournal.points 
            : {};
        
        const hasPoints = Object.keys(pointsData).length > 0;
        
        res.json({
            content: todaysJournal.content,
            points: hasPoints ? pointsData : null,
            activities: todaysJournal.activities || null,
            activitiesProcessed: todaysJournal.activitiesProcessed || false,
            calculatedAt: todaysJournal.activitiesCalculatedAt || null
        });
    } catch (error) {
        console.error('[ERROR] getTodaysJournal:', error);
        res.status(400).json({ error: error.message });
    }
};

const generatePoints = async (diaryEntry) => {
    const prompt = `
    Gemini, please analyze the following diary entry and categorize each activity into one of the following categories: Physical, Cognitive, Social, and Psychological. Assign points to each activity based on the criteria provided below. Here is the diary entry:
    
      ${diaryEntry}
    
        Criteria for assigning points:
    - Sleep:
      - Less than 3 hours: -30 points (Physical and Cognitive)
      - 3 to 6 hours: -15 points (Physical and Cognitive)
      - 7 hours: 10 points (Physical and Cognitive)
      - More than 7 hours: 20 points (Physical and Cognitive)
      - If time is not specified and the content is negative (e.g., not enough sleep): -20 points (Physical and Cognitive)
      - If time is not specified and the content is positive (e.g., well-rested): 20 points (Physical and Cognitive)
    - Physical activities:
       - Vigorous activities (e.g., gym workouts, sports):
        - More than 3 hours: 30 points
        - More than 5 hours: 40 points
        - More than 8 hours: 50 points
        - If time is not specified: 20 points
        - If the entry mentions spending most of the day on a vigorous activity: +50 points (Physical)
      - Moderate activities (e.g., walking, light exercises):
        - More than 3 hours: 15 points
        - More than 5 hours: 20 points
        - More than 8 hours: 30 points
        - If time is not specified: 10 points
        - If the entry mentions spending most of the day on a moderate activity: +30 points (Physical)
    - Social activities:
      - Any social interaction (e.g., meeting friends, attending events): 20 points
    - Cognitive activities:
      - Studying, working on assignments, reading: 
        - More than 3 hours: 30 points
        - More than 5 hours: 40 points
        - More than 8 hours: 50 points
        - If time is not specified: 20 points
        - If the entry mentions spending most of the day on cognitive activities: +50 points (Cognitive)
    - Psychological activities:
      - Engaging in hobbies (e.g., traveling, visiting museums, playing games): 20 points regardless of time
      - If the entry mentions spending most of the day on psychological activities: +50 points (Psychological)
    - Negative activities:
      - Overindulgence in alcohol or unhealthy behaviors: -30 points (Physical)
      - If the entry mentions spending most of the day sitting: -30 points (Physical)
    - Eating habits:
      - Healthy eating habits: 30 points (Physical)
      - Consumption of harmful substances (e.g., alcohol, coffee, energy drinks, tobacco): -30 points (Physical)
    - Feelings & Mood:
      - Good mood: +20 points (Psychological)
      - Bad mood: -20 points (Psychological)
  
      Ignore sentences related to weather or unrelated to the four categories.
    
      Please provide the output in JSON format with the following structure:
      [
        { "text": "Description of activity", "category": "Category", "points": Points }
      ]
      Ensure that the total points for each category do not exceed 100 points.
      `;
  
    try {
        const result = await model.generateContent(prompt);
        
        if (!result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("Invalid model response structure:", result);
            throw new Error("Invalid model response structure");
        }

        const generatedText = result.response.candidates[0].content.parts[0].text;

        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         generatedText.match(/\[([\s\S]*?)\]/);

        if (!jsonMatch) {
            console.error("No JSON found in response:", generatedText);
            return JSON.stringify([{
                "text": "No activities could be extracted from the entry",
                "category": "Psychological",
                "points": 0
            }]);
        }

        try {
            JSON.parse(jsonMatch[1]);
            return jsonMatch[1];
        } catch (parseError) {
            console.error("Invalid JSON in response:", parseError);
            throw new Error("Invalid JSON in model response");
        }
    } catch (error) {
        console.error("Model generation error:", error);
        throw error;
    }
};

const generateResponse = async (req, res) => {
    try {
        const { entry } = req.body;
        
        if (!entry || typeof entry !== 'string') {
            return res.status(400).json({ 
                error: "Invalid entry format. Expected a non-empty string." 
            });
        }

        const markdownResponse = await generatePoints(entry);
        
        if (!markdownResponse) {
            return res.status(500).json({ 
                error: "Failed to generate activities from entry" 
            });
        }

        let activities;
        try {
            activities = JSON.parse(markdownResponse);
            
            if (!Array.isArray(activities)) {
                activities = [activities];
            }
            
            activities = activities.map(activity => ({
                text: String(activity.text || "Unspecified activity"),
                category: ['Physical', 'Psychological', 'Social', 'Cognitive'].includes(activity.category) 
                    ? activity.category 
                    : 'Psychological',
                points: Number(activity.points) || 0
            }));

        } catch (parseError) {
            console.error('[ERROR] JSON parsing failed:', parseError);
            return res.status(500).json({ 
                error: "Failed to parse activity data" 
            });
        }

        res.json(activities);
    } catch (err) {
        console.error("[ERROR] Activity generation failed:", err);
        res.status(500).json({ 
            error: err.message || "Failed to generate activities" 
        });
    }
};

const saveActivityPoints = async (req, res) => {
    try {
        const { 
            points, 
            activities, 
            isRecalculation: explicitRecalculation, 
            previousPoints,
            pointsAlreadySubtracted 
        } = req.body;
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!points || typeof points !== 'object' || Array.isArray(points)) {
            console.error('Invalid points format:', points);
            return res.status(400).json({ error: "Points must be an object with category keys" });
        }

        const journalQuery = {
            user: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        };

        const currentJournal = await Journal.findOne(journalQuery);
        if (!currentJournal) {
            return res.status(404).json({ error: "Today's journal entry not found" });
        }

        const autoDetectedRecalculation = Boolean(
            currentJournal.points && 
            Object.keys(currentJournal.points || {}).length > 0
        );
        
        const isRecalculation = explicitRecalculation === true || autoDetectedRecalculation;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const basePoints = {
            Physical: 100,
            Cognitive: 100,
            Social: 100,
            Psychological: 100
        };

        let updatedTotalPoints = { ...basePoints, ...(user.totalPoints || {}) };
        const pointsToDeduct = previousPoints || currentJournal.points || {};
            
        if (isRecalculation && Object.keys(pointsToDeduct).length > 0 && !pointsAlreadySubtracted) {
            for (const [category, value] of Object.entries(pointsToDeduct)) {
                if (typeof value === 'number' && updatedTotalPoints[category] !== undefined) {
                    updatedTotalPoints[category] -= value;
                }
            }
        }

        for (const [category, value] of Object.entries(points)) {
            if (typeof value === 'number') {
                updatedTotalPoints[category] += value;
            }
        }

        for (const category in updatedTotalPoints) {
            updatedTotalPoints[category] = Math.max(0, updatedTotalPoints[category]);
        }

        const journal = await Journal.findOneAndUpdate(
            journalQuery,
            {
                $set: {
                    points: points,
                    activities: activities,
                    activitiesProcessed: true,
                    activitiesCalculatedAt: new Date()
                }
            },
            { new: true }
        );

        await User.findByIdAndUpdate(
            userId,
            { $set: { totalPoints: updatedTotalPoints } },
            { new: true }
        );

        res.json({
            points: points,
            activities: activities,
            activitiesProcessed: true,
            calculatedAt: journal.activitiesCalculatedAt,
            totalPoints: updatedTotalPoints
        });

    } catch (error) {
        console.error('Error processing activity points:', error);
        res.status(500).json({ error: `Error processing activity points: ${error.message}` });
    }
};

const getWeeklyPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const journals = await Journal.find({
            user: userId,
            date: { $gte: weekAgo },
            points: { $exists: true }
        })
        .select('date points')
        .sort('-date');

        res.json(journals);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const resetProcessingFlag = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const journalQuery = {
            user: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        };
        
        const currentJournal = await Journal.findOne(journalQuery);

        if (!currentJournal) {
            return res.status(404).json({ error: "Today's journal entry not found" });
        }

        let previousPoints = null;
        
        if (currentJournal.points && Object.keys(currentJournal.points).length > 0) {
            previousPoints = { ...currentJournal.points };
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (previousPoints && Object.keys(previousPoints).length > 0) {
            const updatedTotalPoints = { ...(user.totalPoints || {}) };
            
            for (const [category, value] of Object.entries(previousPoints)) {
                if (updatedTotalPoints[category] !== undefined && typeof value === 'number') {
                    updatedTotalPoints[category] -= value;
                }
            }
            
            for (const category in updatedTotalPoints) {
                updatedTotalPoints[category] = Math.max(0, updatedTotalPoints[category]);
            }
            
            await User.findByIdAndUpdate(
                userId,
                { $set: { totalPoints: updatedTotalPoints } },
                { new: true }
            );
            
            console.log(`Points reversed for user ${userId}:`, 
                Object.entries(previousPoints).reduce((acc, [category, value]) => {
                    acc[category] = -value;
                    return acc;
                }, {})
            );
        }
        
        const journal = await Journal.findOneAndUpdate(
            journalQuery,
            {
                $set: {
                    activitiesProcessed: false,
                    activities: [],
                    points: {},
                    activitiesCalculatedAt: null
                }
            },
            { new: true }
        );
        
        if (!journal) {
            return res.status(500).json({ error: "Failed to reset journal entry" });
        }
        
        res.json({ 
            message: "Processing flag reset successfully",
            previousPoints: previousPoints || {},
            hadPoints: !!previousPoints,
            pointsReset: !!previousPoints
        });
    } catch (error) {
        console.error('Error resetting activity processing:', error);
        res.status(500).json({ error: `Error resetting activity processing: ${error.message}` });
    }
};

module.exports = {
    getTodaysJournal,
    generateResponse,
    saveActivityPoints,
    getWeeklyPoints,
    resetProcessingFlag
};