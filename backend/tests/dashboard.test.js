const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server.js");
const api = supertest(app);
const User = require("../models/User.js");
const Journal = require("../models/Journal.js");

let token = null;
let journalId = null;
const userData = {
  username: "MattiS",
  password: "R3g5T7#gh"
};

const journalData = {
  content: "Today I slept for 8 hours, studied for 2 hours, and exercised for 1 hour. I met with friends for lunch and enjoyed my hobby of reading in the evening."
};

const pointsData = {
    Physical: 20,
    Cognitive: 30,
    Social: 10,
    Psychological: 15
  };

beforeAll(async () => {
   /*  if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    } */
    try {
    await User.deleteMany({});
    await Journal.deleteMany({});
  
    // Create user and get token
    const userResponse = await api
      .post("/api/users/register")
      .send(userData)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  
    token = userResponse.body.data.token;
  
    // Create a journal entry
    const journalResponse = await api
      .post("/api/users/journal")
      .set("Authorization", `Bearer ${token}`)
      .send(journalData)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  
    journalId = journalResponse.body._id;

    // Save points
    const pointsResponse = await api
      .post("/api/activityRepo/points")
      .set("Authorization", `Bearer ${token}`)
      .send({
        points: pointsData,
        activities: [{
          text: "Slept for 8 hours",
          category: "Physical",
          points: 20
        }],
        isRecalculation: false,
        previousPoints: null,
        pointsAlreadySubtracted: false
      })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    
    if (pointsResponse.status !== 200) {
      throw new Error("Failed to save points during setup");
    }
  
}catch (error) {
    console.error("Error setting up tests:", error);
    process.exit(1);
} 
} );

describe("Dashboard API", () => {

    // Test fetching total points
    it("should fetch total points", async () => {
      const totalPointsResponse = await api
        .get("/api/users/points")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
  
      expect(totalPointsResponse.status).toBe(200);
      expect(totalPointsResponse.body).toHaveProperty("points");
      expect(totalPointsResponse.body.points).toHaveProperty("Physical", 120);
      expect(totalPointsResponse.body.points).toHaveProperty("Cognitive", 130);
      expect(totalPointsResponse.body.points).toHaveProperty("Social", 110);
      expect(totalPointsResponse.body.points).toHaveProperty("Psychological", 115);
    });
    // Test fetching streak data
    it("should fetch streak data", async () => {
        const streakResponse = await api
          .get("/api/users/streak")
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(streakResponse.status).toBe(200);
        expect(streakResponse.body).toHaveProperty("currentStreak");
        expect(streakResponse.body).toHaveProperty("bestStreak");
        expect(streakResponse.body).toHaveProperty("lastEntryDate");
      });
      // Test fetching recommendations based on total points
    it("should fetch recommendations based on total points", async () => {
        const recommendationResponse = await api
          .post("/api/dashboard/getRecommendation")
          .set("Authorization", `Bearer ${token}`)
          .send({
              Physical: 120, // 100 (base) + 20
              Psychological: 115, // 100 (base) + 15
              Social: 110, // 100 (base) + 10
              Cognitive: 130 // 100 (base) + 30
          })
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(recommendationResponse.status).toBe(200);
        expect(recommendationResponse.body).toHaveProperty("category", "Social");
        expect(recommendationResponse.body).toHaveProperty("advice");
      });
});

afterAll(() => {
  mongoose.connection.close();
});