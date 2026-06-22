# Quick Start Guide

## Overview

This guide provides a quick path to get the Food Tracker backend up and running with minimal configuration.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 16+ (for local development)
- Git

## Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd food-tracker-backend
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your preferred settings (optional for quick start)
```

### 3. Start the Application

```bash
docker-compose up --build
```

This command will:
- Start PostgreSQL database
- Build and start the backend service
- Enable live code reloading for development

### 4. Access the Application

- **API Base URL**: http://localhost:5000
- **Database**: postgres://postgres:postgres123@localhost:5432/food_tracker

## Testing the API

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

### User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

This will set an authentication cookie for subsequent requests.

### Protected Route Test

```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Cookie: token=<your-jwt-token>"
```

## AI Integration Quick Start

### Start Ollama

1. Install Ollama from https://ollama.com/
2. Pull the required model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start Ollama service

### Test AI Chat

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<your-jwt-token>" \
  -d '{
    "message": "What should I eat for breakfast?"
  }'
```

## Development Workflow

### Making Code Changes

1. Edit files in the `src/` directory
2. Changes are automatically detected and applied
3. View logs with `docker-compose logs -f backend`

### Stopping the Application

```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

## Next Steps

1. **Review Full Documentation**: Check the [SUMMARY.md](SUMMARY.md) for detailed documentation
2. **Explore API**: Use the [API.md](API.md) documentation to understand all endpoints
3. **Understand Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. **Contribute**: Follow guidelines in [DEVELOPMENT.md](DEVELOPMENT.md)

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Change ports in docker-compose.yml if 5000/5432 are in use
2. **Database Connection**: Ensure PostgreSQL container is running
3. **Authentication Errors**: Verify JWT_SECRET consistency
4. **AI Connection**: Ensure Ollama is running on host machine

### View Logs

```bash
docker-compose logs -f
```

### Access Database

```bash
docker-compose exec postgres psql -U postgres -d food_tracker
```

## Useful Commands

### Docker Management

```bash
# Rebuild and restart
docker-compose up --build

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d food_tracker

# Backup database
docker-compose exec postgres pg_dump -U postgres food_tracker > backup.sql
```

## Need Help?

- Check the full documentation in the `docs/` directory
- Review the source code comments
- Submit issues to the project repository