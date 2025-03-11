const mongoose = require("mongoose");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server.js");
const api = supertest(app);
const User = require("../models/User.js");
const Journal = require("../models/Journal.js");

let token = null;
let userId = null
let borisId = null
let borisToken = null
let friendRequestId = null;

const usersData = [
    { username: "AnnikaK", password: "Pas$w0rd1Pas$w0rd1" },
    { username: "BorisJ", password: "Pas$w0rd2Pas$w0rd1" },
    { username: "CarmenL", password: "Pas$w0rd3" }
  ];
  
  beforeAll(async () => {
    // Clear previous data
    await User.deleteMany({});
    await Journal.deleteMany({});
  
    // Register multiple users
    for (const user of usersData) {
      await api
        .post("/api/users/register")
        .send(user)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }
  
    // Authenticate and get token for the first user
    const loginResponse = await api
      .post("/api/users/login")
      .send({ username: usersData[0].username, password: usersData[0].password })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    
    token = loginResponse.body.data.token;
    userId = jwt.decode(token).id;

    // Fetch BorisJ's user ID for friend request test
    const boris = await User.findOne({ username: "BorisJ" });
    borisId = boris._id;

     // Authenticate Boris to get his token
  const borisLoginResponse = await api
  .post("/api/users/login")
  .send({ username: "BorisJ", password: "Pas$w0rd2Pas$w0rd1" })
  .expect(200)
  .expect("Content-Type", /application\/json/);

   borisToken = borisLoginResponse.body.data.token;
  });

  describe("Friends API", () => {
    it("should search for users", async () => {
        const searchQuery = "BorisJ"; // Define a query for the search
        const searchResponse = await api
          .get(`/api/friends/search?query=${encodeURIComponent(searchQuery)}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(searchResponse.status).toBe(200);
        expect(Array.isArray(searchResponse.body)).toBe(true);
        expect(searchResponse.body.length).toBeGreaterThan(0); // Ensure there are search results
        expect(searchResponse.body[0]).toHaveProperty("username", "BorisJ"); // Validate that the search result contains the expected user
      });
    
      it("should send a friend request", async () => {
        const sendFriendRequestResponse = await api
          .post("/api/friends/request")
          .set("Authorization", `Bearer ${token}`)
          .send({ recipientId: borisId })
          .expect(201)
          .expect("Content-Type", /application\/json/);
    
        expect(sendFriendRequestResponse.status).toBe(201);
        expect(sendFriendRequestResponse.body).toHaveProperty("message", "Friend request sent successfully");
        // Save the friend request ID for later use
        friendRequestId = sendFriendRequestResponse.body.friendRequest._id;
      });
      it("should get friend requests", async () => {
        const getRequestsResponse = await api
          .get("/api/friends/requests")
          .set("Authorization", `Bearer ${borisToken}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(getRequestsResponse.status).toBe(200);
        expect(getRequestsResponse.body).toHaveProperty("received");
        expect(getRequestsResponse.body.received).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({ username: "AnnikaK" })
            })
          ])
        );
        expect(getRequestsResponse.body).toHaveProperty("sent");
      });
      it("should accept a friend request", async () => {
        const acceptFriendRequestResponse = await api
          .post(`/api/friends/request/${friendRequestId}/accept`)
          .set("Authorization", `Bearer ${borisToken}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(acceptFriendRequestResponse.status).toBe(200);
        // Handle both possible responses
        expect(acceptFriendRequestResponse.body.message).toMatch(/Friend request accepted/);
      });
      it("should get friends", async () => {
        const getFriendsResponse = await api
          .get("/api/friends")
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(getFriendsResponse.status).toBe(200);
        expect(Array.isArray(getFriendsResponse.body)).toBe(true);
        expect(getFriendsResponse.body.length).toBeGreaterThan(0);
        expect(getFriendsResponse.body[0]).toHaveProperty("username");
      });
     
      it("should delete a friend", async () => {
        const deleteFriendResponse = await api
          .delete(`/api/friends/${borisId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(deleteFriendResponse.status).toBe(200);
        expect(deleteFriendResponse.body).toHaveProperty("message", "Friend removed successfully");
    
        // Verify friends are removed
        const checkUser = await User.findById(userId);
        const checkFriend = await User.findById(borisId);
        expect(checkUser.friends.includes(borisId)).toBe(false);
        expect(checkFriend.friends.includes(userId)).toBe(false);
      });
    
    });
    // New describe block for cancelling friend requests
  describe("Cancel Friend Request API", () => {
      it("should send a friend request for cancellation test", async () => {
        const sendFriendRequestResponse = await api
          .post("/api/friends/request")
          .set("Authorization", `Bearer ${token}`)
          .send({ recipientId: borisId })
          .expect(201)
          .expect("Content-Type", /application\/json/);
    
        expect(sendFriendRequestResponse.status).toBe(201);
        expect(sendFriendRequestResponse.body).toHaveProperty("message", "Friend request sent successfully");
    
        // Save the friend request ID for later use
        friendRequestId = sendFriendRequestResponse.body.friendRequest._id;
      });
    
      it("should cancel a friend request", async () => {
        const cancelFriendRequestResponse = await api
          .delete(`/api/friends/request/${friendRequestId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
    
        expect(cancelFriendRequestResponse.status).toBe(200);
        expect(cancelFriendRequestResponse.body).toHaveProperty("message", "Friend request canceled successfully");
      });
    });
    // New describe block for rejecting friend requests
    describe("Reject Friend Request API", () => {
        // Authenticate Carmen to get her token
        let carmenToken = null;
        let carmenId = null;
        
        beforeAll(async () => {
        // Fetch CarmenL's user ID for friend request test
        const carmen = await User.findOne({ username: "CarmenL" });
        carmenId = carmen._id;
    
        const carmenLoginResponse = await api
            .post("/api/users/login")
            .send({ username: "CarmenL", password: "Pas$w0rd3" })
            .expect(200)
            .expect("Content-Type", /application\/json/);
    
        carmenToken = carmenLoginResponse.body.data.token;
        });
    
        it("should send a friend request for rejection test", async () => {
        const sendFriendRequestResponse = await api
            .post("/api/friends/request")
            .set("Authorization", `Bearer ${token}`)
            .send({ recipientId: carmenId })
            .expect(201)
            .expect("Content-Type", /application\/json/);
    
        expect(sendFriendRequestResponse.status).toBe(201);
        expect(sendFriendRequestResponse.body).toHaveProperty("message", "Friend request sent successfully");
    
        // Save the friend request ID for later use
        friendRequestId = sendFriendRequestResponse.body.friendRequest._id;
        });
    
        it("should reject a friend request", async () => {
        const rejectFriendRequestResponse = await api
            .post(`/api/friends/request/${friendRequestId}/reject`)
            .set("Authorization", `Bearer ${carmenToken}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    
        expect(rejectFriendRequestResponse.status).toBe(200);
        expect(rejectFriendRequestResponse.body).toHaveProperty("message", "Friend request rejected");
        });
    });
  
    afterAll(() => {
      mongoose.connection.close();
    });
    