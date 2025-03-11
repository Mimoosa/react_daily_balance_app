const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server.js");
const api = supertest(app);
const User = require("../models/User.js");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
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

describe('User Profile', () => {
    it('should get user profile data', async () => {
      const res = await api
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      
      expect(res.body.username).toBe(userData.username);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created');
      expect(res.body).toHaveProperty('points');
      expect(res.body).toHaveProperty('streak');
    });
    it('should update user profile data', async () => {
        const updateData = {
          username: "NewMattiS",
          currentPassword: "R3g5T7#gh",
          newPassword: "NewP4ssW0rd"
        };
    
        const res = await api
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        expect(res.body.message).toBe('Profile updated successfully');
        expect(res.body.updates).toHaveProperty('username', true);
        expect(res.body.updates).toHaveProperty('password', true);
    
        // Verify that the username is updated
        const userRes = await api
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        expect(userRes.body.username).toBe(updateData.username);
      });
      it('should delete user account', async () => {
        const res = await api
          .delete('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);
        
        expect(res.body.message).toBe('User account deleted successfully');
    });
  });