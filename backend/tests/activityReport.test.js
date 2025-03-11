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

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    await mongoose.connect(process.env.MONGODB_URI);
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
});

afterAll(() => {
  mongoose.connection.close();
});