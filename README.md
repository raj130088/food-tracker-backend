# Food Tracker Backend

A comprehensive meal tracking application with AI integration for intelligent nutrition coaching.

## Overview

This Node.js/Express backend provides a complete API for tracking meals, monitoring nutritional intake, and receiving personalized insights through an AI-powered nutrition coach. The application features user authentication, meal logging, food database management, and advanced analytics.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Meal Tracking**: Log meals with detailed nutritional information
- **Food Database**: Search and add foods with macro tracking
- **Nutrition Analytics**: Daily, weekly, and trend analysis of nutritional intake
- **AI Integration**: Intelligent nutrition coaching and natural language food logging
- **MCP Server**: Model Context Protocol server for advanced AI interactions

## Documentation

Complete documentation is available in the [`docs/`](docs/SUMMARY.md) directory:

- [Quick Start Guide](docs/QUICK_START.md) - Get up and running quickly
- [Project Overview](docs/README.md) - Detailed project information
- [System Architecture](docs/ARCHITECTURE.md) - Architecture and design patterns
- [API Documentation](docs/API.md) - Complete API endpoint reference
- [Database Schema](docs/DATABASE.md) - Database structure and relationships
- [AI Integration](docs/AI_INTEGRATION.md) - AI features and implementation
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment and configuration
- [Development Guide](docs/DEVELOPMENT.md) - Contributing and development workflow
- [File Structure](docs/FILE_STRUCTURE.md) - Complete file inventory

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with HttpOnly cookies
- **AI Integration**: Ollama with Llama3.1:8b model
- **MCP Server**: Python-based Model Context Protocol server
- **Validation**: Zod schema validation
- **Containerization**: Docker & Docker Compose

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd food-tracker-backend

# Copy environment configuration
cp .env.example .env

# Start the application
docker-compose up --build
```

The application will be available at http://localhost:5000

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/meals` - Get meals
- `POST /api/meals` - Log new meal
- `GET /api/meals/summary` - Get daily nutrition summary
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/ai/chat` - Chat with AI nutrition coach
- `POST /api/ai/log-natural` - Log food with natural language

## Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   docker-compose up --build
   ```

3. **Run tests** (when implemented):
   ```bash
   npm test
   ```

## Contributing

Please read the [Development Guide](docs/DEVELOPMENT.md) for information on how to contribute to this project.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.