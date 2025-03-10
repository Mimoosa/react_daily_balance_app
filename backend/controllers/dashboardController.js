const model = require("../models/geminiModel");
const User = require("../models/User");
const WeeklyPoints = require("../models/WeeklyPoints");

// Function to generate fitness guidelines
const generateRecomendation = async (
  Physical,
  Psychological,
  Social,
  Cognitive
) => {

  const prompt = `
  Gemini, please analyze the following individual's performance across four key areas: social, cognitive, physical, and psychological. Identify the area with the lowest score and provide specific and actionable advice to improve in that category. Here is the current performance data:


  - Social: ${Social}
  - Cognitive: ${Cognitive}
  - Physical: ${Physical}
  - Psychological: ${Psychological}
 

    Please provide short, straightforward, and friendly advice in JSON format specifically for the area with the lowest score. 
  The JSON response should have the following structure:

  {
    "category": "Lowest scoring category name",
    "advice": "Short, straightforward, and friendly advice"
  }

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

    const { Physical, Psychological, Social, Cognitive } = req.body;
    if (Physical === undefined || Psychological === undefined || Social === undefined || Cognitive === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }
   
    const markdownResponse = await generateRecomendation(
      Physical,
      Psychological,
      Social,
      Cognitive
    );
    console.log('Markdown response:', markdownResponse);

    const jsonMatch = markdownResponse.match(/```json\s*([\s\S]*?)\s*```/);
    console.log('JSON match:', jsonMatch);

    if (!jsonMatch) {
      console.error("No JSON found in the response");
      return res.status(500).json({ error: "Invalid response format. No JSON found." });
    }

    let recommendation;
    try {
      recommendation = JSON.parse(jsonMatch[1]);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: "Error parsing JSON response." });
    }

    res.json(recommendation);
  } catch (err) {
    console.error("Error in generateResponse:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Get the current week's points for the user
 * @route GET /api/dashboard/weekly-points
 * @access Private
 */
const getWeeklyPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current week's start (Sunday) and end (Saturday) dates
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Calculate the date of the most recent Sunday (start of week)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the date of the upcoming Saturday (end of week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Find or create weekly points record
    let weeklyPoints = await WeeklyPoints.findOne({
      user: userId,
      weekStartDate: { $lte: today },
      weekEndDate: { $gte: today }
    });
    
    if (!weeklyPoints) {
      // Create a new weekly points record with default values (100 points per category)
      weeklyPoints = await WeeklyPoints.create({
        user: userId,
        weekStartDate: startOfWeek,
        weekEndDate: endOfWeek,
        points: {
          Physical: 100,
          Psychological: 100,
          Social: 100,
          Cognitive: 100
        },
        isCurrentWeek: true
      });
    }
    
    res.json({
      weeklyPoints: weeklyPoints.points,
      weekStartDate: weeklyPoints.weekStartDate,
      weekEndDate: weeklyPoints.weekEndDate
    });
  } catch (error) {
    console.error('[ERROR] getWeeklyPoints:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update weekly points for the user
 * @route PUT /api/dashboard/weekly-points
 * @access Private
 */
const updateWeeklyPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;
    
    if (!points || typeof points !== 'object') {
      return res.status(400).json({ error: 'Valid points object is required' });
    }
    
    // Get current week's dates
    const today = new Date();
    const currentDay = today.getDay();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Find or create weekly points record
    let weeklyPoints = await WeeklyPoints.findOne({
      user: userId,
      weekStartDate: { $lte: today },
      weekEndDate: { $gte: today }
    });
    
    if (!weeklyPoints) {
      // Create a new weekly points record
      weeklyPoints = await WeeklyPoints.create({
        user: userId,
        weekStartDate: startOfWeek,
        weekEndDate: endOfWeek,
        points: {
          Physical: 100,
          Psychological: 100,
          Social: 100,
          Cognitive: 100
        },
        isCurrentWeek: true
      });
    }
    
    // Update points
    for (const [category, value] of Object.entries(points)) {
      const pointValue = typeof value === 'number' ? value : parseInt(value, 10);
      
      if (!weeklyPoints.points[category]) {
        weeklyPoints.points[category] = 100;
      }
      
      weeklyPoints.points[category] += pointValue;
      
      // Prevent negative values
      if (weeklyPoints.points[category] < 0) {
        weeklyPoints.points[category] = 0;
      }
    }
    
    await weeklyPoints.save();
    
    res.json({
      weeklyPoints: weeklyPoints.points,
      updated: true
    });
  } catch (error) {
    console.error('[ERROR] updateWeeklyPoints:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reset weekly points to 100 for all users (scheduled job for Sunday)
 * This should be called by a cron job every Sunday
 */
const resetWeeklyPoints = async () => {
  try {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Only proceed if today is Sunday (day 0)
    if (currentDay !== 0) {
      console.log('[INFO] resetWeeklyPoints: Today is not Sunday, skipping reset');
      return;
    }
    
    // Calculate new week start and end dates
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Mark all previous weekly points as not current
    await WeeklyPoints.updateMany(
      { isCurrentWeek: true },
      { isCurrentWeek: false }
    );
    
    // Get all users
    const users = await User.find({}, '_id');
    
    // Create new weekly points records for all users
    const bulkOps = users.map(user => ({
      insertOne: {
        document: {
          user: user._id,
          weekStartDate: startOfWeek,
          weekEndDate: endOfWeek,
          points: {
            Physical: 100,
            Psychological: 100,
            Social: 100,
            Cognitive: 100
          },
          isCurrentWeek: true
        }
      }
    }));
    
    if (bulkOps.length > 0) {
      await WeeklyPoints.bulkWrite(bulkOps);
      console.log(`[INFO] resetWeeklyPoints: Reset weekly points for ${users.length} users`);
    }
  } catch (error) {
    console.error('[ERROR] resetWeeklyPoints:', error);
  }
};

module.exports = { generateResponse, getWeeklyPoints, updateWeeklyPoints, resetWeeklyPoints };

