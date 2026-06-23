// tests/ai.api.test.js
const request = require('supertest');
const express = require('express');
const pool = require('../src/config/database');

// Build a lightweight test server harness
const app = express();
app.use(express.json());

// Mock your auth middleware to automatically inject your seeded user (User ID 4)
const mockAuth = (req, res, next) => {
  req.user = { id: 4, name: 'Amrit Tester', daily_calorie_goal: 2200 };
  next();
};

// Mount your controller directly for testing isolation
const aiController = require('../src/ai/ai.controller');
app.post('/api/ai/log-natural', mockAuth, aiController.logNaturalLanguage);

describe('AI Logging - Integration Tests', () => {
  
  // Close the database pool after tests complete so Jest can exit
  afterAll(async () => {
    await pool.end();
  });

  it('should reject requests with empty payload messages with a 400', async () => {
    const res = await request(app)
      .post('/api/ai/log-natural')
      .send({ message: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should process valid strings, save to database, and return a structured payload', async () => {
    const res = await request(app)
      .post('/api/ai/log-natural')
      .send({ message: "Had 2 whole eggs for breakfast" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Check whichever key layout your controller uses
    const mealPayload = res.body.data || res.body.saved_meal;
    expect(mealPayload).toBeDefined();
    expect(mealPayload.meal_type).toBe('Breakfast');
  });
});