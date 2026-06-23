# Development Guide

## Overview

This guide provides information for developers working on the Food Tracker backend application. It covers code organization, development setup, testing procedures, and contribution guidelines.

## Code Organization

The application follows a modular architecture with clear separation of concerns:

```
src/
├── ai/                 # AI integration components
│   ├── providers/      # AI service providers (Ollama)
│   ├── ai.controller.js # AI route handlers
│   ├── ai.routes.js    # AI route definitions
│   ├── ai.service.js   # AI business logic
│   └── prompt.builder.js # AI prompt construction
├── config/             # Configuration files
│   └── database.js     # Database connection pool
├── controllers/        # Route handlers
│   ├── auth.controller.js
│   ├── meal.controller.js
│   └── user.controller.js
├── middleware/         # Express middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validate.middleware.js
├── models/             # Database models
│   ├── food.model.js
│   ├── meal.model.js
│   └── user.model.js
├── routes/             # API route definitions
│   ├── auth.routes.js
│   ├── meal.routes.js
│   └── user.routes.js
├── services/           # Business logic services
│   ├── analytics.service.js
│   ├── meal.service.js
│   └── user.service.js
├── utils/              # Utility functions
│   └── validation.js   # Zod validation schemas
└── server.js           # Application entry point
```

### Directory Purposes

- **ai/**: Contains all AI-related functionality including providers, services, and prompt engineering
- **config/**: Application configuration files including database connection
- **controllers/**: Handle HTTP requests, validate input, and return responses
- **middleware/**: Cross-cutting concerns like authentication, validation, and error handling
- **models/**: Data access layer that interacts directly with the database
- **routes/**: API endpoint definitions that map URLs to controller methods
- **services/**: Business logic layer that orchestrates operations across models
- **utils/**: Helper functions and utilities used throughout the application

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL client (psql)
- Ollama (for AI features)
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd food-tracker-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

4. **Start development environment**:
   ```bash
   docker-compose up --build
   ```

### Development Workflow

1. **Start development server**:
   ```bash
   docker-compose up --build
   ```

2. **Make code changes**:
   - Changes to source files are automatically detected and applied
   - The application will restart automatically with nodemon

3. **View logs**:
   ```bash
   docker-compose logs -f backend
   ```

4. **Run tests** (when implemented):
   ```bash
   npm test
   ```

5. **Stop development environment**:
   ```bash
   docker-compose down
   ```

## Coding Standards

### JavaScript Style

The project follows standard JavaScript conventions with some specific guidelines:

1. **Use CommonJS modules**:
   ```javascript
   const express = require('express');
   module.exports = someFunction;
   ```

2. **Asynchronous functions**:
   - Use `async/await` instead of callbacks
   - Handle errors with try/catch blocks
   - Return Promises where appropriate

3. **Error handling**:
   - Use the global error middleware for consistent error responses
   - Log errors appropriately for debugging
   - Don't expose sensitive information in error responses

4. **Code structure**:
   - Keep functions focused and small
   - Use descriptive variable and function names
   - Comment complex logic
   - Follow the existing patterns in the codebase

### Database Interactions

1. **Use parameterized queries** to prevent SQL injection:
   ```javascript
   const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
   ```

2. **Handle database errors gracefully**:
   ```javascript
   try {
     const result = await pool.query(query, params);
     return result.rows[0];
   } catch (error) {
     console.error('Database error:', error);
     throw new Error('Error fetching user');
   }
   ```

3. **Use transactions for related operations**:
   ```javascript
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // Perform multiple related operations
     await client.query('COMMIT');
   } catch (error) {
     await client.query('ROLLBACK');
     throw error;
   } finally {
     client.release();
   }
   ```

### API Design

1. **Consistent response format**:
   ```javascript
   // Success response
   res.json({
     success: true,
     data: { /* ... */ }
   });
   
   // Error response
   res.status(400).json({
     success: false,
     message: 'Error description'
   });
   ```

2. **Use appropriate HTTP status codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
   - 500: Internal Server Error

3. **Validate input with Zod**:
   ```javascript
   const validationSchemas = {
     register: z.object({
       email: z.string().email('Invalid email'),
       password: z.string().min(6, 'Password must be at least 6 characters')
     })
   };
   ```

## Adding New Features

### Creating a New API Endpoint

1. **Define the route** in the appropriate routes file:
   ```javascript
   router.get('/new-endpoint', authMiddleware, controller.newEndpoint);
   ```

2. **Create the controller method**:
   ```javascript
   async newEndpoint(req, res) {
     try {
       // Business logic
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ success: false, message: 'Error message' });
     }
   }
   ```

3. **Implement business logic** in a service if needed:
   ```javascript
   const newService = {
     async performOperation(data) {
       // Database operations and business logic
       return result;
     }
   };
   ```

4. **Add database model methods** if new data access is needed:
   ```javascript
   const NewModel = {
     async findOrCreate(data) {
       // Database query
       return result;
     }
   };
   ```

### Adding AI Features

1. **Create a new prompt builder method** in `prompt.builder.js`:
   ```javascript
   buildNewPrompt(context, userMessage) {
     return `
   Context: ${context}
   User: ${userMessage}
   Instructions: ...
   `;
   }
   ```

2. **Add a new method to the AI service**:
   ```javascript
   async handleNewAIInteraction(user, userMessage) {
     const prompt = promptBuilder.buildNewPrompt(user.context, userMessage);
     const response = await ollamaProvider.chat(prompt);
     return processResponse(response);
   }
   ```

3. **Create a new controller method**:
   ```javascript
   async newAIEndpoint(req, res) {
     try {
       const result = await aiService.handleNewAIInteraction(req.user, req.body.message);
       res.json({ success: true, result });
     } catch (error) {
       res.status(500).json({ success: false, message: 'Error processing request' });
     }
   }
   ```

4. **Add the route** to `ai.routes.js`:
   ```javascript
   router.post('/new-ai-endpoint', authMiddleware, aiController.newAIEndpoint);
   ```

### Extending MCP Tools

1. **Create a new tool file** in `mcp-server/tools/`:
   ```python
   @mcp.tool()
   async def new_tool(param1: str, param2: int) -> str:
       """
       Tool description
       """
       # Implementation
       return result
   ```

2. **Import the tool** in `mcp-server/server.py`:
   ```python
   from tools.new_tool import *
   ```

## Testing

### Current Testing Approach

The application now includes automated tests using Jest as the testing framework. Testing is performed through:

1. **Unit tests** for individual functions and methods with mocked dependencies
2. **API integration tests** using Supertest to simulate HTTP requests
3. **Edge case and resilience tests** to ensure graceful handling of unexpected inputs
4. **Database verification** with direct SQL queries when needed

Test files are located in the `tests/` directory with the following structure:
```
tests/
├── ai.api.test.js       # API integration tests for AI endpoints
├── ai.service.test.js   # Unit tests for AI service layer
└── ai.edge.test.js      # Edge case and resilience tests
```

For detailed information about the testing strategy, see [TESTING.md](TESTING.md).

### Running Tests

To run the test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

### Adding New Tests

When adding new tests, follow these guidelines:

1. Place unit tests in `ai.service.test.js`
2. Place API integration tests in `ai.api.test.js`
3. Place edge case tests in `ai.edge.test.js`
4. Use descriptive test names that clearly indicate what is being tested
5. Mock external dependencies to ensure tests are isolated
6. Test both success and failure scenarios
7. Validate all expected response properties

## Debugging

### Common Debugging Techniques

1. **Add console.log statements** for quick debugging:
   ```javascript
   console.log('Debug info:', variable);
   ```

2. **Use the debug logging**:
   ```bash
   DEBUG=* npm run dev
   ```

3. **Check Docker logs**:
   ```bash
   docker-compose logs -f backend
   ```

4. **Database querying** for data verification:
   ```bash
   docker-compose exec postgres psql -U postgres -d food_tracker -c "SELECT * FROM users;"
   ```

### Error Investigation

1. **Check server logs** for error stack traces
2. **Verify database connectivity** and query correctness
3. **Check environment variables** for correct configuration
4. **Validate input data** and API request format

## Contributing

### Git Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "Add new feature: description"
   ```

3. **Push and create pull request**:
   ```bash
   git push origin feature/new-feature-name
   ```

### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example commit messages:
```
Add user profile update endpoint

Implement PUT /api/users/profile for updating user information
including validation and database update.

Closes #123
```

### Code Review Process

All changes should be reviewed before merging:

1. **Self-review** before pushing
2. **Peer review** through pull requests
3. **Automated checks** for code style and potential issues
4. **Integration testing** to verify functionality

### Documentation Updates

When adding new features:

1. **Update API.md** with new endpoints
2. **Update relevant documentation** files
3. **Add code comments** for complex logic
4. **Update README.md** if major features are added

## Development Tools

### Recommended VS Code Extensions

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Docker**: Dockerfile and docker-compose syntax highlighting
- **REST Client**: API testing within VS Code
- **GitLens**: Enhanced Git capabilities

### Debugging with VS Code

Create a `.vscode/launch.json` configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Performance Considerations

### Database Optimization

1. **Use indexes** for frequently queried columns
2. **Limit result sets** with pagination
3. **Use connection pooling** for efficient database access
4. **Optimize complex queries** with EXPLAIN ANALYZE

### API Performance

1. **Implement caching** for frequently accessed data
2. **Use efficient algorithms** for data processing
3. **Limit payload sizes** for API responses
4. **Implement rate limiting** to prevent abuse

## Security Best Practices

### Code Security

1. **Validate all inputs** with Zod schemas
2. **Sanitize user data** before database storage
3. **Use parameterized queries** to prevent SQL injection
4. **Hash passwords** with bcrypt
5. **Use HTTPS** in production

### Dependency Management

1. **Regularly update dependencies**:
   ```bash
   npm outdated
   npm update
   ```

2. **Audit for vulnerabilities**:
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use exact versions** for critical dependencies in production

## Future Development Roadmap

### Phase 6 Features

1. **JSON Parser**: Implement strict JSON parser for natural language food logging
2. **Enhanced AI**: Improve prompt engineering and response quality
3. **Advanced Analytics**: Add more detailed nutritional insights

### Long-term Improvements

1. **Microservices**: Split application into separate services
2. **Real-time Features**: Add WebSocket support for live updates
3. **Mobile API**: Optimize API for mobile applications
4. **Internationalization**: Support multiple languages
5. **Accessibility**: Improve accessibility compliance

## Troubleshooting Common Issues

### Development Environment Issues

1. **Port conflicts**:
   - Change ports in docker-compose.yml
   - Stop conflicting services

2. **Database connection errors**:
   - Verify DATABASE_URL in .env
   - Check PostgreSQL container status
   - Ensure Docker networks are correct

3. **Node.js version issues**:
   - Use Node.js 16 or higher
   - Consider using nvm for version management

4. **Permission errors**:
   - Check file permissions
   - Ensure Docker has necessary permissions

### AI Integration Issues

1. **Ollama connection failures**:
   - Verify Ollama is running
   - Check host.docker.internal resolution
   - Ensure model is downloaded

2. **Prompt engineering issues**:
   - Test prompts manually with Ollama
   - Refine prompt templates
   - Add examples to improve responses

3. **MCP server errors**:
   - Check Python dependencies
   - Verify MCP server is running
   - Check network connectivity to backend