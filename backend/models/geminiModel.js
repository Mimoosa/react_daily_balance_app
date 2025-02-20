
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// - gemini-2.0-flash
// - gemini-2.0-flash-lite-preview-02-05
// - gemini-1.5-flash
// - gemini-1.5-pro
// GoogleGenerativeAI setup
const MODEL_NAME = "gemini-2.0-flash"; // Try changing to "gemini-1.5-pro" or other models

const geminiConfig = {
  maxOutputTokens: 4096,
  temperature: 0.2,
  topP: 0.1,
  topK: 16,
};

// 
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  geminiConfig, 
});


module.exports = model;