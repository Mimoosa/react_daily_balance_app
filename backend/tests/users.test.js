const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server.js");
const api = supertest(app);
const User = require("../models/User");



beforeAll(async () => {
  await User.deleteMany({});
});

describe("User Routes", () => {
  describe("POST /api/users/register", () => {
    it("should signup a new user with valid credentials", async () => {
      // Arrange
      const userData = {
        "username": "MattiK",
        "password": "R3g5T7#gh",
      };

      // Act
      const result = await api.post("/api/users/register").send(userData);

      // Assert
      expect(result.status).toBe(201);
      expect(result.body.data).toHaveProperty("token");
    });

     it("should return an error with invalid credentials", async () => {
      // Arrange
      const userData = {
        username: "MattiK",
        password: "invalidPassword",
      };

      // Act
      const result = await api.post("/api/users/register").send(userData);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    }); 
  });

  describe("POST /api/users/login", () => {
    it("should login a user with valid credentials", async () => {
      // Arrange
      const userData = {
        username: "MattiK",
        password: "R3g5T7#gh",
      };

      // Act
      const result = await api.post("/api/users/login").send(userData);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.data).toHaveProperty("token");
    });

    it("should return an error with invalid credentials", async () => {
      // Arrange
      const userData = {
        username: "MattiK",
        password: "invalidPassword",
      };

      // Act
      const result = await api.post("/api/users/login").send(userData);

      // Assert
      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});