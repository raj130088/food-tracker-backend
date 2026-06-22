# System Architecture

## Overview

The Food Tracker application follows a modular, layered architecture that separates concerns into distinct components. This design enables scalability, maintainability, and clear separation of business logic from infrastructure concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Client/UI                                │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTP/HTTPS
┌─────────────────────────────▼───────────────────────────────────────┐
│                        Load Balancer (Optional)                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                          API Gateway                                │
│                    (Express.js Application)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Routes    │  │ Controllers │  │  Services   │  │   Models    │ │
│  │             │  │             │  │             │  │             │ │
│  │ Auth Routes │  │ Auth Ctrl   │  │ User Svc    │  │ User Model  │ │
│  │ Meal Routes │  │ Meal Ctrl   │  │ Meal Svc    │  │ Meal Model  │ │
│  │ User Routes │  │ User Ctrl   │  │ Analytics   │  │ Food Model  │ │
│  │ AI Routes   │  │ AI Ctrl     │  │             │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                          Middleware                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Auth MW   │  │  Error MW   │  │ Validate MW │  │   Logging   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                            AI Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Ollama Provider                              │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │ │
│  │  │ Prompt Bldr │  │ AI Service  │  │ AI Ctrl     │              │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                          MCP Server                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Python FastMCP Server                        │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐                              │ │
│  │  │ Meal Tools  │  │ Analytics   │                              │ │
│  │  │             │  │ Tools       │                              │ │
│  │  └─────────────┘  └─────────────┘                              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ Database Protocol
┌─────────────────────────────▼───────────────────────────────────────┐
│                          PostgreSQL                                 │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │    Users    │  │  Meal Logs  │  │ Meal Items  │  │   Foods     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### 1. API Layer (Express.js)

The API layer is built with Express.js and consists of:

- **Routes**: Define the API endpoints and map them to controller methods
- **Controllers**: Handle incoming requests, validate input, and return responses
- **Middleware**: Cross-cutting concerns like authentication, validation, and error handling
- **Services**: Business logic layer that orchestrates operations across models
- **Models**: Data access layer that interacts with the database

### 2. AI Layer

The AI layer provides intelligent features:

- **Ollama Provider**: Interface to the local Ollama AI service
- **AI Service**: Business logic for AI interactions
- **Prompt Builder**: Constructs prompts for AI models
- **AI Controller**: Handles AI-related API requests

### 3. MCP Server

The Model Context Protocol server provides advanced tools for AI interactions:

- **FastMCP Server**: Python-based MCP implementation
- **Analytics Tools**: Tools for retrieving nutritional analytics
- **Meal Tools**: Tools for meal logging and management

### 4. Data Layer

The data layer uses PostgreSQL with:

- **Users Table**: User profiles and authentication information
- **Meal Logs Table**: Meal entries with metadata
- **Meal Items Table**: Individual food items in meals
- **Foods Table**: Food database with nutritional information
- **Weight Logs Table**: User weight tracking over time

## Data Flow

1. **Client Request**: Client sends HTTP request to Express server
2. **Middleware Processing**: Request passes through authentication and validation middleware
3. **Controller Handling**: Controller receives request and calls appropriate service methods
4. **Service Orchestration**: Services coordinate business logic and interact with models
5. **Model Database Access**: Models perform database operations
6. **Response Generation**: Controller formats response and sends to client

For AI interactions:
1. **AI Request**: Client sends request to AI endpoints
2. **Prompt Construction**: AI controller/service builds appropriate prompt
3. **Ollama Interaction**: Request sent to local Ollama service
4. **Response Processing**: AI response is processed and returned to client

For MCP interactions:
1. **Tool Request**: MCP server receives tool call from AI
2. **API Communication**: MCP tools communicate with backend API
3. **Data Retrieval**: Backend processes request and returns data
4. **Tool Response**: MCP server returns formatted response to AI

## Security Architecture

- **Authentication**: JWT tokens with HttpOnly cookies
- **Authorization**: Role-based access control through middleware
- **Data Validation**: Zod schema validation on all inputs
- **Secure Headers**: Helmet middleware for HTTP security headers
- **CORS**: Configured CORS policy for controlled access
- **Password Security**: bcryptjs for password hashing

## Scalability Considerations

- **Database Indexes**: Strategic indexes on frequently queried columns
- **Connection Pooling**: PostgreSQL connection pooling for efficient database access
- **Caching**: Potential for Redis caching of frequently accessed data
- **Load Balancing**: Horizontal scaling through multiple backend instances
- **Microservices**: Potential to split services into separate microservices

## Deployment Architecture

The application is designed for containerized deployment:

- **Docker Containers**: Separate containers for backend, database, and MCP server
- **Docker Compose**: Orchestration for multi-container deployment
- **Environment Configuration**: Environment-specific configuration through .env files
- **Volume Persistence**: Docker volumes for database persistence
- **Network Isolation**: Docker networks for secure service communication