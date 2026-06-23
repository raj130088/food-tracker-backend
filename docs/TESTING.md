# Testing Documentation

This document provides comprehensive information about the testing strategy, structure, and implementation for the Food Tracker backend application.

## Overview

The application uses Jest as the testing framework with Supertest for API integration testing. Tests are organized in the `tests/` directory and follow a structured approach to ensure code quality and reliability.

## Test Structure

```
tests/
├── ai.api.test.js       # API integration tests for AI endpoints
├── ai.service.test.js   # Unit tests for AI service layer
└── ai.edge.test.js      # Edge case and resilience tests
```

## Test Categories

### 1. Unit Tests (`ai.service.test.js`)

These tests focus on individual functions and methods without external dependencies. They mock external services to isolate the unit under test.

**Key Features:**
- Mocks the Groq provider to avoid hitting the real API
- Tests the `handleNaturalLogging` function in the AI service
- Validates successful extraction of structured data from AI responses

**Example Test:**
```javascript
it('should successfully extract structured data from raw text responses', async () => {
  const mockUser = { name: 'Amrit' };
  const result = await aiService.handleNaturalLogging(mockUser, "I ate two eggs");

  expect(result.success).toBe(true);
  expect(result.data.meal_type).toBe('Breakfast');
  // ... additional assertions
});
```

### 2. API Integration Tests (`ai.api.test.js`)

These tests validate the complete API flow, including request handling, authentication, and response formatting.

**Key Features:**
- Uses Supertest to simulate HTTP requests
- Tests the `/api/ai/log-natural` endpoint
- Includes a mock authentication middleware for testing isolation
- Validates both success and error scenarios

**Example Tests:**
- Rejection of empty payload messages with 400 status
- Processing of valid strings, saving to database, and returning structured payload

### 3. Edge Case & Resilience Tests (`ai.edge.test.js`)

These tests ensure the application handles unexpected or malformed inputs gracefully without crashing.

**Key Features:**
- Tests resilience against malformed LLM outputs
- Validates JSON parsing with various formats (plain text, markdown blocks, etc.)
- Tests database boundary handling for unrecognized food entries
- Validates handling of special cases like invalid meal types, empty arrays, etc.

**Example Tests:**
- Handling of plain text instead of JSON from LLM
- Parsing JSON surrounded by conversational text
- Handling of unrecognized food entries without SQL errors
- Graceful handling of invalid meal types by defaulting to "Snack"
- Processing of special characters in food names

## Running Tests

To run the test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

To run specific test files:

```bash
npm test tests/ai.service.test.js
```

## Mocking Strategy

The tests use Jest's mocking capabilities extensively:

1. **Provider Mocking**: The Groq provider is mocked to avoid external API calls during testing
2. **Service Mocking**: Meal service functions are mocked for integration tests
3. **Authentication Mocking**: A lightweight mock authentication middleware is used for API tests

## Test Data Strategy

Tests use consistent test data patterns:

- User ID: 4 (Amrit Tester)
- Daily calorie goal: 2200
- Common food items: eggs, banana, apple, salmon, etc.

## Coverage Areas

The current test suite covers:

1. **Input Validation**: Empty payloads, malformed data
2. **Successful Processing**: Valid inputs and expected outputs
3. **Error Handling**: Graceful degradation when services fail
4. **Data Parsing**: Various JSON formats from AI responses
5. **Database Integration**: Handling of recognized and unrecognized food items
6. **Edge Cases**: Special characters, long messages, invalid enum values

## Adding New Tests

When adding new tests, follow these guidelines:

1. Place unit tests in `ai.service.test.js`
2. Place API integration tests in `ai.api.test.js`
3. Place edge case tests in `ai.edge.test.js`
4. Use descriptive test names that clearly indicate what is being tested
5. Mock external dependencies to ensure tests are isolated
6. Test both success and failure scenarios
7. Validate all expected response properties

## Future Improvements

Planned testing enhancements include:

1. **Expanded Coverage**: Additional test cases for all API endpoints
2. **Performance Tests**: Load testing for high-concurrency scenarios
3. **Security Tests**: Validation of authentication and authorization
4. **Database Tests**: Direct testing of model operations
5. **Regression Tests**: Automated verification of bug fixes