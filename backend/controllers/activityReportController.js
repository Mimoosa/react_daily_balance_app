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

        // Return both content and points if they exist
        res.json({
            content: todaysJournal.content,
            points: todaysJournal.points || null,
            activities: todaysJournal.activities || null
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const generatePoints = async (diaryEntry) => {
    console.log(diaryEntry)
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
    
        // The ?. (optional chaining) operator allows you to safely access properties that might not exist. If result is null or undefined, the entire expression will return undefined, instead of throwing an error.
        if (!result?.response?.candidates?.length) {
          return false; // Return early if the response structure is not as expected
        }
        // Extract the relevant text from the response
        const generatedText = result.response.candidates[0].content.parts[0].text;
        return generatedText;
      } catch (error) {
        console.error("LLM Error:", error);
        throw new Error(`Failed to generate fitness plan: ${error.message}`);
      }
  };

const generateResponse = async (req, res) => {
  try {
    const { entry } = req.body;
   /*  if (!entry) {
      return res.status(400).json({ message: "Today's diary entry is required." });
    }
 */
   
    const markdownResponse = await generatePoints(entry);
    console.log('Markdown response:', markdownResponse);

    const jsonMatch = markdownResponse.match(/```json\s*([\s\S]*?)\s*```/);
    console.log('JSON match:', jsonMatch);

    if (!jsonMatch) {
      console.error("No JSON found in the response");
      return res.status(500).json({ error: "Invalid response format. No JSON found." });
    }

    let activities;
    try {
      activities = JSON.parse(jsonMatch[1]);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: "Error parsing JSON response." });
    }
    res.json(activities);
  } catch (err) {
    console.error("Error in generateResponse:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Saves activity points for today's journal entry and updates user's total points
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.points - Points by category
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If saving fails or journal entry not found
 */
const saveActivityPoints = async (req, res) => {
    try {
        const { points } = req.body;
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const journal = await Journal.findOne({
            user: userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!journal) {
            return res.status(404).json({ error: "Today's journal entry not found" });
        }

        /**
         * FEATURE: Handle updating existing points
         * 
         * This section handles the case where a journal entry is updated and
         * new points need to be calculated. We need to:
         * 1. Check if we're updating existing points
         * 2. If updating, subtract the old points from the user's total
         * 3. Add the new points to the user's total
         * 
         * This ensures that the user's total points remain accurate when
         * journal entries are updated and points are recalculated.
         */
        
        // Check if this is an update to existing points
        const isUpdating = journal.points && Object.keys(journal.points).length > 0;
        
        // If updating existing points, subtract old points from user's total
        if (isUpdating) {
            const user = await User.findById(userId);
            if (user) {
                // Subtract the old points from the user's total points
                Object.keys(journal.points).forEach(category => {
                    if (user.points[category] !== undefined) {
                        user.points[category] -= journal.points[category];
                        // Ensure we don't go below 0
                        if (user.points[category] < 0) user.points[category] = 0;
                    }
                });
                await user.save();
            }
        }
        
        // Update journal with new points
        journal.points = points;
        await journal.save();
        
        // Update user's total points with new points
        const user = await User.findById(userId);
        if (user) {
            // Add the new points to the user's existing points
            Object.keys(points).forEach(category => {
                if (user.points[category] !== undefined) {
                    user.points[category] += points[category];
                } else {
                    user.points[category] = points[category];
                }
            });
            await user.save();
        }

        res.json(journal);
    } catch (error) {
        res.status(400).json({ error: error.message });
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

module.exports = {
    getTodaysJournal,
    generateResponse,
    saveActivityPoints,
    getWeeklyPoints
};