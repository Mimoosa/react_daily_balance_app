const model = require("../models/geminiModel");

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
    if (!Physical || !Psychological || !Social || !Cognitive) {
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


module.exports = { generateResponse };

