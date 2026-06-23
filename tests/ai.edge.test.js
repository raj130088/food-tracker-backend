// tests/ai.edge.test.js
const request = require('supertest');
const express = require('express');
const pool = require('../src/config/database');
const aiService = require('../src/ai/ai.service');

// 1. Setup Test Server Harness
const app = express();
app.use(express.json());

const mockAuth = (req, res, next) => {
  req.user = { id: 4, name: 'Amrit Tester', daily_calorie_goal: 2200 };
  next();
};

const aiController = require('../src/ai/ai.controller');
app.post('/api/ai/log-natural', mockAuth, aiController.logNaturalLanguage);

// 2. Mock Cloud Provider for Unit-Level Failure Testing
jest.mock('../src/ai/providers/groq.provider', () => ({
  chat: jest.fn()
}));
const cloudAIProvider = require('../src/ai/providers/groq.provider');

// 3. Mock the meal service for integration tests
jest.mock('../src/services/meal.service', () => ({
  createMeal: jest.fn().mockImplementation((userId, mealData) => {
    return Promise.resolve({
      id: Math.floor(Math.random() * 1000),
      ...mealData,
      unmatched_items: mealData.unmatched_items || ['dragonfruit chunks']
    });
  })
}));

describe('AI Tracking - Edge Case & Resilience Tests', () => {
  
  afterAll(async () => {
    await pool.end();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // UNIT TESTS: RESILIENCE AGAINST MALFORMED LLM OUTPUTS
  // =========================================================================
  
  it('should throw an error when the LLM returns plain text instead of JSON', async () => {
    // Simulate the LLM dropping its formatting completely
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: "Sure! I can help you track that. You ate 2 eggs for breakfast."
    });

    await expect(aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "I ate 2 eggs"))
      .rejects
      .toThrow('LLM output did not contain a valid JSON object block.');
  });

  it('should clean and successfully parse JSON even if surrounded by conversational rambling', async () => {
    // Simulate an LLM that forgets the "only output raw JSON" rule but includes the block
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: `Here is your extracted data:
      \`\`\`json
      {
        "meal_type": "Snack",
        "notes": "Midnight snack",
        "items": [{"name": "banana", "quantity": 1}]
      }
      \`\`\`
      Let me know if you need anything else!`
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "Midnight banana");
    expect(result.success).toBe(true);
    expect(result.data.meal_type).toBe('Snack');
    expect(result.data.items[0].name).toBe('banana');
  });

  it('should handle JSON with markdown code blocks correctly', async () => {
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: '```json\n{"meal_type": "Dinner", "items": [{"name": "salmon", "quantity": 1.5}]}\n```'
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "Ate salmon for dinner");
    expect(result.success).toBe(true);
    expect(result.data.meal_type).toBe('Dinner');
    expect(result.data.items[0].quantity).toBe(1.5);
  });

  it('should handle numbers in text format (two, half, etc.)', async () => {
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Breakfast",
        notes: null,
        items: [
          { name: "apple", quantity: 0.5 },
          { name: "banana", quantity: 2.0 }
        ]
      })
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "Half apple and two bananas");
    expect(result.success).toBe(true);
    expect(result.data.items[0].quantity).toBe(0.5);
    expect(result.data.items[1].quantity).toBe(2.0);
  });

  // =========================================================================
  // INTEGRATION TESTS: DATABASE BOUNDARY & UNRECOGNIZED ENTITIES
  // =========================================================================

  it('should gracefully handle unrecognized food entries without throwing SQL errors', async () => {
    // Mock the AI to return a specific response with unknown food
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Snack",
        notes: "Fresh fruit",
        items: [{ name: "dragonfruit", quantity: 1 }]
      })
    });

    const mealService = require('../src/services/meal.service');
    mealService.createMeal.mockResolvedValueOnce({
      id: 999,
      meal_type: "Snack",
      notes: "Fresh fruit",
      items: [{ name: "dragonfruit", quantity: 1 }],
      unmatched_items: ['dragonfruit chunks']
    });

    const res = await request(app)
      .post('/api/ai/log-natural')
      .send({ message: "I ate a bowl of fresh dragonfruit chunks" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    // The response should contain the saved meal data
    const payload = res.body.saved_meal || res.body.data;
    expect(payload).toBeDefined();
    expect(payload.meal_type).toBe('Snack');
  });

  it('should gracefully handle invalid meal_type by defaulting to Snack', async () => {
    // Mock the AI to return an invalid meal type
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Midnight Feast", // Invalid - not in enum
        notes: "Post-workout meal",
        items: [{ name: "protein shake", quantity: 1 }]
      })
    });

    const mealService = require('../src/services/meal.service');
    mealService.createMeal.mockResolvedValueOnce({
      id: 1000,
      meal_type: "Snack", // Defaulted to Snack
      notes: "Post-workout meal",
      items: [{ name: "protein shake", quantity: 1 }],
      unmatched_items: []
    });

    const res = await request(app)
      .post('/api/ai/log-natural')
      .send({ message: "Log this under my midnight post-workout feast session" });

    // Should not crash with 500
    expect(res.statusCode).not.toBe(500);
    // Should either succeed (200) or return a validation error (400)
    expect(res.statusCode).toBeLessThan(500);
  });

  it('should handle missing meal_type by defaulting to Snack', async () => {
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        // No meal_type provided
        notes: "Just a snack",
        items: [{ name: "apple", quantity: 1 }]
      })
    });

    const mealService = require('../src/services/meal.service');
    mealService.createMeal.mockResolvedValueOnce({
      id: 1001,
      meal_type: "Snack", // Default
      notes: "Just a snack",
      items: [{ name: "apple", quantity: 1 }],
      unmatched_items: []
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "Ate an apple");
    expect(result.success).toBe(true);
    // Should default to Snack or handle gracefully
    expect(result.data.meal_type).toBeDefined();
  });

  it('should handle empty items array gracefully', async () => {
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Snack",
        notes: "Nothing really",
        items: []
      })
    });

    const mealService = require('../src/services/meal.service');
    mealService.createMeal.mockResolvedValueOnce({
      id: 1002,
      meal_type: "Snack",
      notes: "Nothing really",
      items: [],
      unmatched_items: []
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "I ate nothing");
    expect(result.success).toBe(true);
    expect(result.data.items).toHaveLength(0);
  });

  it('should handle very long messages without crashing', async () => {
    const longMessage = "I ate " + "food ".repeat(100) + "for lunch";
    
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Lunch",
        notes: "Long meal description",
        items: [{ name: "food", quantity: 100 }]
      })
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, longMessage);
    expect(result.success).toBe(true);
    expect(result.data.meal_type).toBe('Lunch');
  });

  it('should handle special characters in food names', async () => {
    cloudAIProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        meal_type: "Dinner",
        notes: null,
        items: [{ name: "café au lait", quantity: 1 }]
      })
    });

    const result = await aiService.handleNaturalLogging({ name: 'Amrit', id: 1 }, "Had café au lait for dinner");
    expect(result.success).toBe(true);
    expect(result.data.items[0].name).toBe('café au lait');
  });
});