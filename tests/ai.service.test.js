// tests/ai.service.test.js
const aiService = require('../src/ai/ai.service');

// Mock the provider so we don't hit the real Groq API during unit testing
jest.mock('../src/ai/providers/groq.provider', () => ({
  chat: jest.fn(() => ({
    content: JSON.stringify({
      meal_type: "Breakfast",
      notes: "Feeling energized",
      items: [{ name: "whole eggs", quantity: 2 }]
    })
  }))
}));

describe('AI Service - Unit Tests', () => {
  it('should successfully extract structured data from raw text responses', async () => {
    const mockUser = { name: 'Amrit' };
    const result = await aiService.handleNaturalLogging(mockUser, "I ate two eggs");

    expect(result.success).toBe(true);
    expect(result.data.meal_type).toBe('Breakfast');
    expect(result.data.items[0].name).toBe('whole eggs');
    expect(result.data.items[0].quantity).toBe(2);
  });
});