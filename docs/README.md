# Food Tracker Backend

## Project Overview

A comprehensive meal tracking application built with Node.js and Express, featuring AI integration for intelligent nutrition coaching and natural language food logging. The application allows users to track their meals, monitor nutritional intake, and receive personalized insights through an AI-powered nutrition coach.

## Main Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Meal Tracking**: Log meals with detailed nutritional information
- **Food Database**: Search and add foods with macro tracking
- **Nutrition Analytics**: Daily, weekly, and trend analysis of nutritional intake
- **AI Integration**: Intelligent nutrition coaching and natural language food logging
- **MCP Server**: Model Context Protocol server for advanced AI interactions
- **Docker Deployment**: Containerized application for easy deployment

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with HttpOnly cookies
- **AI Integration**: Ollama with Llama3.1:8b model
- **MCP Server**: Python-based Model Context Protocol server
- **Validation**: Zod schema validation
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet, CORS, and bcryptjs

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
Client → API Routes → Controllers → Services/Models → Database
              ↓
           AI Routes → AI Controller → AI Service → Ollama Provider
              ↓
           MCP Server ←→ Backend API for advanced analytics
```

### Key Components

1. **Express Server**: Main application entry point handling routing and middleware
2. **PostgreSQL Database**: Stores user profiles, meal logs, and food data
3. **AI Layer**: Ollama integration for natural language processing and nutrition coaching
4. **MCP Server**: Python server providing advanced analytics tools for AI interactions
5. **Docker Environment**: Containerized deployment with separate services for database and backend

## Key Dependencies

- `express`: Web framework for Node.js
- `pg`: PostgreSQL client for database interactions
- `jsonwebtoken`: JWT implementation for authentication
- `bcryptjs`: Password hashing for security
- `ollama`: Client for local AI model interactions
- `zod`: Schema validation for request payloads
- `cors`, `helmet`, `morgan`: Security and logging middleware
- `cookie-parser`: Cookie handling for authentication tokens

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL (when running without Docker)
- Ollama (for AI features)

### Installation Steps

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
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

4. **Run with Docker (recommended)**:
   ```bash
   docker-compose up --build
   ```

5. **Run locally (without Docker)**:
   ```bash
   npm run dev
   ```

### Development vs Production

- **Development**: Uses `docker-compose.override.yml` with live reload
- **Production**: Uses base `docker-compose.yml` with optimized images

## API Endpoints

The API is organized into several resource-based routes:

- `/api/auth` - User authentication (register, login, logout)
- `/api/meals` - Meal tracking and food database
- `/api/users` - User profile management
- `/api/ai` - AI-powered nutrition coaching

## Contributing

This project follows standard Node.js/Express patterns with clear separation of concerns through models, controllers, services, and middleware. New features should maintain this architectural pattern.