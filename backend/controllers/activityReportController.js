const Journal = require('../models/Journal');


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
        res.json(todaysJournal.content);
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
    - Less than 3 hours: -50 points (Physical and Cognitive)
    - 3 to 6 hours: -30 points (Physical and Cognitive)
    - 7 hours: 10 points (Physical and Cognitive)
    - More than 7 hours: 20 points (Physical and Cognitive)
    - If time is not specified and the content is negative (e.g., not enough sleep): -20 points (Physical and Cognitive)
    - If time is not specified and the content is positive (e.g., well-rested): 20 points (Physical and Cognitive)
  - Physical activities:
    - Vigorous activities (e.g., gym workouts, sports): 20 points per 30 minutes
    - Moderate activities (e.g., walking, light exercises): 10 points per 30 minutes
    - If time is not specified:
      - Vigorous activities: 20 points
      - Moderate activities: 10 points
    - If the entry mentions spending most of the day on a vigorous activity: +100 points (Physical)
    - If the entry mentions spending most of the day on a moderate activity: +50 points (Physical)
  - Social activities:
    - Any social interaction (e.g., meeting friends, attending events): 30 points
  - Cognitive activities:
    - Studying, working on assignments, reading: 10 points per 30 minutes
    - If time is not specified: 10 points
    - If the entry mentions spending most of the day on cognitive activities: +60 points (Cognitive)
  - Psychological activities:
    - Engaging in hobbies (e.g., traveling, visiting museums, playing games): 30 points regardless of time
    - If the entry mentions spending most of the day on psychological activities: +60 points (Psychological)
  - Negative activities:
    - Overindulgence in alcohol or unhealthy behaviors: -30 points (Physical)
    - If the entry mentions spending most of the day sitting: -50 points (Physical)

  
    Please provide the output in JSON format with the following structure:
    [
      { "text": "Description of activity", "category": "Category", "points": Points }
    ]
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





module.exports = {getTodaysJournal, generateResponse};