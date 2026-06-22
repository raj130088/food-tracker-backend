# AI Integration Documentation

## Overview

The Food Tracker application integrates artificial intelligence through Ollama and a Model Context Protocol (MCP) server to provide intelligent nutrition coaching and natural language food logging capabilities. This documentation covers the AI architecture, configuration, prompt engineering, and tool integrations.

## AI Architecture

The AI integration consists of three main components:

1. **Ollama Provider**: Node.js interface to the local Ollama service
2. **MCP Server**: Python-based server providing advanced tools for AI interactions
3. **AI Service Layer**: Business logic for processing AI requests and responses

```
Client → AI Routes → AI Controller → AI Service → Ollama Provider ↔ Ollama (Llama3.1:8b)
                                              ↓
                                        Prompt Builder
                                              ↓
                                        MCP Server Tools ←→ Backend API
```

## AI Providers

### Ollama Configuration

The application uses Ollama as the local AI engine with the following configuration:

- **Model**: Llama3.1:8b
- **Host**: `http://host.docker.internal:11434` (Docker network routing)
- **Provider File**: `src/ai/providers/ollama.provider.js`

The Ollama provider is configured to communicate with the Ollama service running on the host machine from within the Docker container environment.

### Prompt Engineering

The application uses two main prompt templates:

#### Nutrition Analysis Prompt
```javascript
buildNutritionAnalysis(user, dailySummary, userMessage) {
  return `
You are a helpful nutrition coach.

User Profile:
- Name: ${user.name || 'User'}
- Daily Calorie Goal: ${user.daily_calorie_goal}
- Diet Type: ${user.diet_type || 'None'}
- Allergies: ${user.allergies ? user.allergies.join(', ') : 'None'}

Today's Summary:
- Calories consumed: ${dailySummary.total_calories}
- Remaining: ${user.daily_calorie_goal - dailySummary.total_calories}

User Question: ${userMessage}

Give a short, friendly, and actionable response.
`;
}
```

#### Food Logging Prompt
```javascript
buildFoodLoggingPrompt(userMessage) {
  return `
Extract food items from this message and return structured data.

Message: "${userMessage}"

Return only valid JSON in this format:
{
  "foods": [
    {
      "name": "banana",
      "quantity": 2,
      "unit": "piece"
    }
  ],
  "meal_type": "Snack"
}
`;
}
```

## AI Service Flow

### Nutrition Query Flow

1. **Client Request**: User sends message to `/api/ai/chat`
2. **Controller**: `aiController.chatWithCoach` receives request
3. **Analytics**: Fetch daily summary from `analyticsService.getDailySummary`
4. **Prompt Building**: `promptBuilder.buildNutritionAnalysis` creates context-aware prompt
5. **Ollama Call**: `ollamaProvider.chat` sends prompt to Llama3.1:8b model
6. **Response Processing**: AI response is formatted and returned to client

### Natural Language Logging Flow

1. **Client Request**: User sends natural language description to `/api/ai/log-natural`
2. **Controller**: `aiController.logNaturalLanguage` receives request
3. **Prompt Building**: `promptBuilder.buildFoodLoggingPrompt` creates extraction prompt
4. **Ollama Call**: `ollamaProvider.chat` sends prompt to Llama3.1:8b model
5. **Response Processing**: Raw JSON response is returned to client for validation

## MCP Server Integration

The Model Context Protocol server provides advanced tools for AI interactions:

### Server Configuration

- **Language**: Python
- **Framework**: FastMCP
- **File**: `mcp-server/server.py`
- **Tools Location**: `mcp-server/tools/`

### Available Tools

#### 1. Analytics Tools (`mcp-server/tools/analytics_tools.py`)

**get_daily_nutrition_summary**
- **Description**: Fetches daily nutrition summary for a user
- **Parameters**:
  - `user_id`: Integer user ID
  - `session_cookie`: Authentication cookie
  - `date`: Optional date string (YYYY-MM-DD)
- **Returns**: Formatted string with calories, protein, carbs, and fat consumed

#### 2. Meal Tools (`mcp-server/tools/meal_tools.py`)

**add_user_meal**
- **Description**: Logs a new meal for a user
- **Parameters**:
  - `user_id`: Integer user ID
  - `meal_type`: String meal type ('Breakfast', 'Lunch', 'Dinner', 'Snack')
  - `items`: List of food items with food_id/name and quantity
- **Returns**: Success or failure message

### Tool Communication Flow

1. **AI Request**: AI model requests tool execution through MCP protocol
2. **Tool Execution**: MCP server executes tool function
3. **API Call**: Tool makes HTTP request to backend API
4. **Data Processing**: Backend processes request and returns data
5. **Tool Response**: MCP server returns formatted response to AI model

## Implementation Details

### Ollama Provider (`src/ai/providers/ollama.provider.js`)

The Ollama provider uses the `ollama` npm package to communicate with the local Ollama service:

```javascript
const { Ollama } = require('ollama');
const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });

async chat(prompt, options = {}) {
  const response = await ollama.chat({
    model: 'llama3.1:8b',
    messages: [{ role: 'user', content: prompt }],
    ...options
  });
  
  return {
    content: response.message.content,
    raw: response
  };
}
```

### AI Service (`src/ai/ai.service.js`)

The AI service orchestrates interactions between the application and AI providers:

```javascript
async handleNutritionQuery(user, userMessage) {
  const dailySummary = await analyticsService.getDailySummary(user.id);
  const prompt = promptBuilder.buildNutritionAnalysis(user, dailySummary, userMessage);
  const response = await ollamaProvider.chat(prompt);
  
  return {
    reply: response.content,
    metadata: {
      calories_consumed: dailySummary.total_calories
    }
  };
}

async handleNaturalLogging(user, userMessage) {
  const prompt = promptBuilder.buildFoodLoggingPrompt(userMessage);
  const response = await ollamaProvider.chat(prompt);
  
  return {
    raw: response.content,
  };
}
```

### Prompt Builder (`src/ai/prompt.builder.js`)

The prompt builder creates context-aware prompts for AI interactions:

```javascript
buildNutritionAnalysis(user, dailySummary, userMessage) {
  // Creates personalized nutrition coaching prompt
}

buildFoodLoggingPrompt(userMessage) {
  // Creates structured data extraction prompt
}
```

## Future Enhancements

### JSON Parsing
Phase 6 development will include a strict JSON parser to convert natural language extraction results into structured data that can be directly piped into the meal logging service.

### Advanced Prompt Engineering
Future improvements could include:
- Few-shot learning examples in prompts
- Persona-based responses for different coaching styles
- Contextual memory for conversation history
- Multi-modal inputs for image-based food recognition

### Tool Expansion
Additional MCP tools could provide:
- Recipe suggestions based on dietary preferences
- Meal planning capabilities
- Nutritional deficiency analysis
- Integration with external nutrition databases

## Error Handling

The AI integration includes comprehensive error handling:

- **Ollama Errors**: Network failures or model issues are caught and returned as user-friendly messages
- **Prompt Validation**: Invalid prompt responses are handled gracefully
- **Tool Failures**: MCP tool execution errors are logged and communicated appropriately
- **Timeout Handling**: Long-running AI requests are managed with appropriate timeouts

## Performance Considerations

- **Caching**: Future implementations could cache common AI responses
- **Asynchronous Processing**: Long-running AI tasks are processed asynchronously
- **Resource Management**: Ollama model loading and memory usage is managed by the Ollama service
- **Rate Limiting**: Potential rate limiting for AI requests to prevent resource exhaustion

## Security Considerations

- **Input Sanitization**: User inputs are sanitized before being included in prompts
- **Authentication**: All AI interactions require user authentication
- **Data Privacy**: User data is only included in prompts with explicit user context
- **API Security**: MCP tools use secure communication with the backend API