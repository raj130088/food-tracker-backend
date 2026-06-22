# File Structure Inventory

## Overview

This document provides a comprehensive inventory of all files in the Food Tracker backend application, detailing the purpose, key exports/functions, dependencies, and usage of each file.

## Root Files

### /package.json
- **Purpose**: Node.js project configuration, dependencies, and scripts
- **Key exports/functions**: N/A (configuration file)
- **Dependencies**: Node.js runtime
- **Used by**: npm, Docker build process

### /package-lock.json
- **Purpose**: Lock file for npm dependencies ensuring consistent installations
- **Key exports/functions**: N/A (dependency tree specification)
- **Dependencies**: npm
- **Used by**: npm install process

### /Dockerfile
- **Purpose**: Docker image definition for the backend service
- **Key exports/functions**: N/A (build instructions)
- **Dependencies**: Node.js base image
- **Used by**: Docker build process

### /docker-compose.yml
- **Purpose**: Production Docker Compose configuration
- **Key exports/functions**: N/A (service definitions)
- **Dependencies**: Docker
- **Used by**: docker-compose

### /docker-compose.override.yml
- **Purpose**: Development Docker Compose overrides for live reloading
- **Key exports/functions**: N/A (service overrides)
- **Dependencies**: Docker
- **Used by**: docker-compose (development)

### /.env.example
- **Purpose**: Example environment variables file for configuration
- **Key exports/functions**: N/A (configuration template)
- **Dependencies**: dotenv package
- **Used by**: Environment configuration

### /.env
- **Purpose**: Environment variables for application configuration
- **Key exports/functions**: N/A (configuration values)
- **Dependencies**: dotenv package
- **Used by**: Application startup

### /.gitignore
- **Purpose**: Specifies files and directories to be ignored by Git
- **Key exports/functions**: N/A (ignore patterns)
- **Dependencies**: Git
- **Used by**: Git

### /schema.sql
- **Purpose**: Database schema definition for PostgreSQL
- **Key exports/functions**: N/A (SQL schema)
- **Dependencies**: PostgreSQL
- **Used by**: Database initialization

### /updates.sql
- **Purpose**: Database schema updates and migrations
- **Key exports/functions**: N/A (SQL updates)
- **Dependencies**: PostgreSQL
- **Used by**: Database migration

### /init.sql
- **Purpose**: Initial database setup and seed data
- **Key exports/functions**: N/A (SQL initialization)
- **Dependencies**: PostgreSQL
- **Used by**: Database initialization

### /server.log
- **Purpose**: Application log file
- **Key exports/functions**: N/A (log data)
- **Dependencies**: Application logging
- **Used by**: Log analysis

### /server_debug.log
- **Purpose**: Detailed application debug log file
- **Key exports/functions**: N/A (debug log data)
- **Dependencies**: Application logging
- **Used by**: Debugging

### /test-ai.js
- **Purpose**: Test script for AI integration
- **Key exports/functions**: Test functions for Ollama
- **Dependencies**: ollama package
- **Used by**: Development testing

### /test-register.js
- **Purpose**: Test script for user registration
- **Key exports/functions**: Test functions for auth
- **Dependencies**: axios
- **Used by**: Development testing

## /src/server.js (Main Entry Point)

### /src/server.js
- **Purpose**: Main application entry point, sets up Express server and routes
- **Key exports/functions**: N/A (application bootstrap)
- **Dependencies**: express, cors, morgan, helmet, dotenv, route files, middleware
- **Used by**: Node.js runtime

## /src/config/

### /src/config/database.js
- **Purpose**: Database connection pool configuration
- **Key exports/functions**: pool (PostgreSQL connection pool)
- **Dependencies**: pg package, dotenv
- **Used by**: All model files

## /src/models/

### /src/models/user.model.js
- **Purpose**: Data access layer for user-related database operations
- **Key exports/functions**: 
  - create(userData) - Create new user
  - findByEmail(email) - Find user by email
  - findById(id) - Find user by ID
  - update(id, updateData) - Update user profile
- **Dependencies**: database.js, bcryptjs
- **Used by**: auth.controller.js, auth.middleware.js, user.controller.js

### /src/models/meal.model.js
- **Purpose**: Data access layer for meal-related database operations
- **Key exports/functions**:
  - create(userId, mealData) - Create new meal log with items
  - getByDate(userId, date) - Get meals for specific date
  - getHistory(userId, filters) - Get meal history with pagination
- **Dependencies**: database.js
- **Used by**: meal.service.js

### /src/models/food.model.js
- **Purpose**: Data access layer for food-related database operations
- **Key exports/functions**:
  - search(query) - Search foods by name
  - findById(id) - Get food by ID
  - create(foodData, userId) - Add custom food
- **Dependencies**: database.js
- **Used by**: meal.controller.js

## /src/controllers/

### /src/controllers/auth.controller.js
- **Purpose**: Handle authentication-related HTTP requests
- **Key exports/functions**:
  - register(req, res) - Register new user
  - login(req, res) - Authenticate user
  - logout(req, res) - Log out user
- **Dependencies**: user.model.js, jsonwebtoken, bcryptjs
- **Used by**: auth.routes.js

### /src/controllers/meal.controller.js
- **Purpose**: Handle meal tracking HTTP requests
- **Key exports/functions**:
  - searchFoods(req, res) - Search foods
  - logMeal(req, res) - Log a meal
  - getMeals(req, res) - Get meals for date
  - getDailySummary(req, res) - Get daily nutrition summary
  - getWeeklySummary(req, res) - Get weekly summary
  - getHistory(req, res) - Get meal history
  - deleteMeal(req, res) - Delete meal
  - getMacroBreakdown(req, res) - Get macro breakdown
  - getCalorieTrend(req, res) - Get calorie trend
- **Dependencies**: food.model.js, meal.service.js, analytics.service.js
- **Used by**: meal.routes.js

### /src/controllers/user.controller.js
- **Purpose**: Handle user profile-related HTTP requests
- **Key exports/functions**:
  - getProfile(req, res) - Get user profile
  - updateProfile(req, res) - Update user profile
- **Dependencies**: user.service.js
- **Used by**: user.routes.js

## /src/services/

### /src/services/meal.service.js
- **Purpose**: Business logic for meal operations
- **Key exports/functions**:
  - createMeal(userId, mealData) - Create meal
  - getMealsByDate(userId, date) - Get meals by date
  - getHistory(userId, filters) - Get meal history
  - deleteMeal(userId, mealId) - Delete meal
- **Dependencies**: meal.model.js, database.js
- **Used by**: meal.controller.js

### /src/services/user.service.js
- **Purpose**: Business logic for user operations
- **Key exports/functions**:
  - getProfile(userId) - Get user profile
  - updateProfile(userId, updateData) - Update user profile
- **Dependencies**: user.model.js
- **Used by**: user.controller.js

### /src/services/analytics.service.js
- **Purpose**: Business logic for analytics and reporting
- **Key exports/functions**:
  - getDailySummary(userId, date) - Get daily nutrition summary
  - getWeeklySummary(userId) - Get weekly summary
  - getMacroBreakdown(userId, date) - Get macro breakdown
  - getCalorieTrend(userId) - Get calorie trend
- **Dependencies**: database.js
- **Used by**: meal.controller.js, ai.service.js

## /src/routes/

### /src/routes/auth.routes.js
- **Purpose**: Define authentication-related API endpoints
- **Key exports/functions**: router (Express router)
- **Dependencies**: express, auth.controller.js, validate.middleware.js
- **Used by**: server.js

### /src/routes/meal.routes.js
- **Purpose**: Define meal tracking API endpoints
- **Key exports/functions**: router (Express router)
- **Dependencies**: express, meal.controller.js, auth.middleware.js, validate.middleware.js
- **Used by**: server.js

### /src/routes/user.routes.js
- **Purpose**: Define user profile API endpoints
- **Key exports/functions**: router (Express router)
- **Dependencies**: express, user.controller.js, auth.middleware.js, validate.middleware.js
- **Used by**: server.js

### /src/routes/ai.routes.js
- **Purpose**: Define AI integration API endpoints
- **Key exports/functions**: router (Express router)
- **Dependencies**: express, ai.controller.js, auth.middleware.js
- **Used by**: server.js

## /src/middleware/

### /src/middleware/auth.middleware.js
- **Purpose**: Authentication middleware for protected routes
- **Key exports/functions**: authMiddleware (Express middleware)
- **Dependencies**: jsonwebtoken, user.model.js
- **Used by**: Route files for protected endpoints

### /src/middleware/error.middleware.js
- **Purpose**: Global error handling middleware
- **Key exports/functions**: errorHandler (Express middleware)
- **Dependencies**: express
- **Used by**: server.js

### /src/middleware/validate.middleware.js
- **Purpose**: Request validation middleware using Zod schemas
- **Key exports/functions**: validate (middleware factory)
- **Dependencies**: validation.js
- **Used by**: Route files for request validation

## /src/utils/

### /src/utils/validation.js
- **Purpose**: Zod validation schemas for request payloads
- **Key exports/functions**: validationSchemas object with named schemas
- **Dependencies**: zod
- **Used by**: validate.middleware.js

## /src/ai/

### /src/ai/ai.controller.js
- **Purpose**: Handle AI integration HTTP requests
- **Key exports/functions**:
  - chatWithCoach(req, res) - Chat with nutrition coach
  - logNaturalLanguage(req, res) - Log food with natural language
- **Dependencies**: ai.service.js
- **Used by**: ai.routes.js

### /src/ai/ai.service.js
- **Purpose**: Business logic for AI interactions
- **Key exports/functions**:
  - handleNutritionQuery(user, userMessage) - Handle nutrition questions
  - handleNaturalLogging(user, userMessage) - Handle natural language logging
- **Dependencies**: ollama.provider.js, prompt.builder.js, analytics.service.js
- **Used by**: ai.controller.js

### /src/ai/ai.routes.js
- **Purpose**: Define AI integration API endpoints
- **Key exports/functions**: router (Express router)
- **Dependencies**: express, ai.controller.js, auth.middleware.js
- **Used by**: server.js

### /src/ai/prompt.builder.js
- **Purpose**: Construct prompts for AI models
- **Key exports/functions**:
  - buildNutritionAnalysis(user, dailySummary, userMessage) - Build nutrition coach prompt
  - buildFoodLoggingPrompt(userMessage) - Build food logging prompt
- **Dependencies**: N/A
- **Used by**: ai.service.js

### /src/ai/providers/ollama.provider.js
- **Purpose**: Interface to Ollama AI service
- **Key exports/functions**:
  - chat(prompt, options) - Send chat request to Ollama
- **Dependencies**: ollama package
- **Used by**: ai.service.js

## /mcp-server/

### /mcp-server/server.py
- **Purpose**: Model Context Protocol server for advanced AI tools
- **Key exports/functions**: mcp (FastMCP server instance)
- **Dependencies**: fastmcp, httpx, tool modules
- **Used by**: AI models via MCP protocol

### /mcp-server/tools/analytics_tools.py
- **Purpose**: MCP tools for analytics data retrieval
- **Key exports/functions**:
  - get_daily_nutrition_summary(user_id, session_cookie, date) - Get daily nutrition summary
- **Dependencies**: httpx, server.py
- **Used by**: server.py

### /mcp-server/tools/meal_tools.py
- **Purpose**: MCP tools for meal operations
- **Key exports/functions**:
  - add_user_meal(user_id, meal_type, items) - Add user meal
- **Dependencies**: httpx, server.py
- **Used by**: server.py

### /mcp-server/__pycache__/
- **Purpose**: Python bytecode cache directory
- **Key exports/functions**: N/A (compiled Python files)
- **Dependencies**: Python runtime
- **Used by**: Python interpreter