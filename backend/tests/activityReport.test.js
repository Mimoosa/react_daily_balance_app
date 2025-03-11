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
}catch (error) {
    console.error("Error setting up tests:", error);
    process.exit(1);
} 
} );


describe("User and Journal API", () => {
    // Test fetching today's journal entry
    it("should fetch today's journal entry", async () => {
      expect(token).not.toBeNull(); // Ensure token is not null
  
      const response = await api
        .get("/api/activityRepo/journal")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
  
      expect(response.body).toHaveProperty("content", journalData.content);
      expect(response.status).toBe(200);
    });

    // Test sending journalData.content to /api/activityRepo/activity and receiving activities
    it("should send todays journal entry and receive activities", async () => {
        const activityResponse = await api
          .post("/api/activityRepo/activity")
          .set("Authorization", `Bearer ${token}`)
          .send({ entry: journalData.content })
          .expect(200)
          .expect("Content-Type", /application\/json/);

        expect(activityResponse.status).toBe(200);
        expect(Array.isArray(activityResponse.body)).toBe(true);
        expect(activityResponse.body.length).toBeGreaterThan(0);
        expect(activityResponse.body[0]).toHaveProperty("category");
        expect(activityResponse.body[0]).toHaveProperty("points");
        expect(activityResponse.body[0]).toHaveProperty("text");
    });
    // Test sending points to /api/activityRepo/points and saving them
    it("should save points and return updated points and activities", async () => {
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

        expect(pointsResponse.status).toBe(200);
        expect(pointsResponse.body).toHaveProperty("points");
        expect(pointsResponse.body).toHaveProperty("activities");
        expect(pointsResponse.body).toHaveProperty("activitiesProcessed", true);
        expect(pointsResponse.body).toHaveProperty("calculatedAt");
        expect(pointsResponse.body).toHaveProperty("totalPoints");
    });
      // Test resetting the processing flag on /api/activityRepo/reset-processing
      it("should reset processing flag and return previous points", async () => {
        const resetResponse = await api
          .post("/api/activityRepo/reset-processing")
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);

        expect(resetResponse.status).toBe(200);
        expect(resetResponse.body).toHaveProperty("message", "Processing flag reset successfully");
        expect(resetResponse.body).toHaveProperty("previousPoints");
        expect(resetResponse.body).toHaveProperty("hadPoints");
        expect(resetResponse.body).toHaveProperty("pointsReset");
    });
});

afterAll(() => {
  mongoose.connection.close();
});