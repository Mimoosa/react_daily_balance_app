const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server.js");
const api = supertest(app);
const User = require("../models/User.js");
const Journal = require("../models/Journal.js");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  await Journal.deleteMany({});
   // Create user and get token
   const result = await api
   .post("/api/users/register")
   .send(userData)
   .expect(201)
   .expect("Content-Type", /application\/json/);

 token = result.body.data.token;
});

afterAll(() => {
  mongoose.connection.close();
});

const userData = {
  username: "MattiS",
  password: "R3g5T7#gh"
};

const journalData = {
  content: "Today I slept for 8 hours, studied for 2 hours, and exercised for 1 hour. I met with friends for lunch and enjoyed my hobby of reading in the evening."
};

const updatedJournalData = {
  content: "I updated the journal content. Today I focused on my work and spent time with family."
};

describe("User and Journal API", () => {
 
  // Test creating a journal entry
  it("should create a new journal entry", async () => {
    expect(token).not.toBeNull(); // Ensure token is not null
    const response = await api
      .post("/api/users/journal")
      .set("Authorization", `Bearer ${token}`)
      .send(journalData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.content).toBe(journalData.content);
    expect(response.body.analysis).toBeDefined(); // Assuming analysis will be added
    expect(response.body.date).toBeDefined();

    // Store journal ID for the update test
    updatedJournalData.id = response.body._id;
  });

 // Test updating a journal entry
 it("should update an existing journal entry", async () => {
  expect(token).not.toBeNull(); // Ensure token is not null

  const response = await api
    .put(`/api/users/journal/${updatedJournalData.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedJournalData)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(response.body.content).toBe(updatedJournalData.content);
  expect(response.body.date).toBeDefined();
});
// Test fetching all journals
it("should fetch all journals", async () => {
  expect(token).not.toBeNull(); // Ensure token is not null

  const response = await api
    .get("/api/users/journals")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBeGreaterThan(0);
  expect(response.body[0]).toHaveProperty("content");
  expect(response.body[0]).toHaveProperty("date");
});
// Test creating a journal entry with invalid data (400 Bad Request)
it("should return 400 when creating a journal entry with invalid data", async () => {
  const invalidJournalData = { content: "" }; // Empty content
  const response = await api
    .post("/api/users/journal")
    .set("Authorization", `Bearer ${token}`)
    .send(invalidJournalData)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(response.body).toHaveProperty("error");
});

});