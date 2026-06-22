# Deployment & Configuration

## Overview

The Food Tracker application is designed for containerized deployment using Docker and Docker Compose. This documentation covers the deployment architecture, configuration options, environment variables, and operational procedures for running the application in both development and production environments.

## Docker Configuration

### Dockerfile

The application uses a multi-stage Docker build process:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

Key features:
- Uses Node.js 20 Alpine image for minimal footprint
- Installs dependencies before copying application code for better caching
- Exposes port 5000 for the Express server
- Runs in development mode by default with nodemon

### Docker Compose Configuration

The application uses two Docker Compose files:

#### Base Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: food-tracker-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: food_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: psyduck130088/food-tracker-backend:latest
    container_name: food-tracker-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres123@postgres:5432/food_tracker
      - JWT_SECRET=your_super_secret_jwt_key_change_in_production
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Development Override (`docker-compose.override.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: food-tracker-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: food_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    image: food-tracker-backend:local
    container_name: food-tracker-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres123@postgres:5432/food_tracker
      - JWT_SECRET=your_super_secret_jwt_key_change_in_production
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

volumes:
  postgres_data:
```

Key differences in development override:
- Builds from local source code instead of pulling image
- Mounts local directory for live code reloading
- Excludes node_modules from volume mount to prevent conflicts

## Environment Variables

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres123@postgres:5432/food_tracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

### Variable Descriptions

- **PORT**: Port number for the Express server (default: 5000)
- **DATABASE_URL**: PostgreSQL connection string with format `postgres://user:password@host:port/database`
- **JWT_SECRET**: Secret key for JWT token signing (must be changed in production)
- **NODE_ENV**: Environment mode ('development' or 'production')

### Example Production Configuration

For production deployment, update the environment variables:

```env
PORT=5000
DATABASE_URL=postgres://user:secure_password@db-host:5432/food_tracker
JWT_SECRET=super_secret_production_key_with_high_entropy
NODE_ENV=production
```

## Running the Application

### Development Mode

To run the application in development mode with live reloading:

```bash
docker-compose up --build
```

This command:
1. Builds the backend service from local source code
2. Starts PostgreSQL database container
3. Starts backend container with volume mounts for live reloading
4. Maps ports 5432 (PostgreSQL) and 5000 (backend) to localhost

### Production Mode

To run the application in production mode:

```bash
docker-compose up -d
```

This command:
1. Pulls the pre-built backend image from Docker Hub
2. Starts PostgreSQL database container
3. Starts backend container in detached mode
4. Maps necessary ports to localhost

### Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop services and remove volumes (WARNING: This will delete all data):

```bash
docker-compose down -v
```

## Database Initialization

The database is automatically initialized with the schema defined in `schema.sql`. This file contains:

- Table definitions for users, meal_logs, meal_items, foods, and weight_logs
- Primary key and foreign key constraints
- Index definitions for performance optimization
- Check constraints for data validation

### Schema Updates

Database schema updates are managed through `updates.sql` which contains:

```sql
-- Add personalization fields for AI
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS diet_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS food_preferences TEXT[],
ADD COLUMN IF NOT EXISTS food_dislikes TEXT[];

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
```

These updates are applied automatically when the application starts.

## Ollama Integration

The AI features require Ollama to be running on the host machine:

### Installation

1. Install Ollama from https://ollama.com/
2. Pull the required model:
   ```bash
   ollama pull llama3.1:8b
   ```

### Configuration

Ollama is configured to be accessible from within the Docker container at `http://host.docker.internal:11434`. This special DNS name allows containers to access services running on the host machine.

## MCP Server Deployment

The Model Context Protocol server is a separate Python service that needs to be deployed alongside the main application:

### Requirements

- Python 3.8+
- Required Python packages (installed via pip):
  - fastmcp
  - httpx

### Running the MCP Server

From the `mcp-server` directory:

```bash
python server.py
```

The MCP server communicates with the backend API through HTTP requests, using the `BACKEND_URL` environment variable (defaults to `http://localhost:5000/api`).

## Logging Configuration

The application uses multiple logging mechanisms:

### Morgan Logging

HTTP request logging is handled by Morgan middleware with the 'dev' format, which provides colored output for different HTTP methods and response codes.

### Application Logging

The application logs important events and errors to:
- Console output (stdout/stderr)
- Log files (`server.log` and `server_debug.log`)

### Error Handling

Global error handling is implemented through:
- Custom error middleware in `src/middleware/error.middleware.js`
- Structured error responses with appropriate HTTP status codes
- Detailed error logging for debugging

## Scaling Considerations

### Horizontal Scaling

For production deployments, consider:

1. **Load Balancing**: Use a load balancer to distribute traffic across multiple backend instances
2. **Database Connection Pooling**: Configure appropriate connection pool sizes for PostgreSQL
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use a CDN for static assets if serving frontend files

### Resource Requirements

Minimum recommended resources:
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 10GB available disk space
- **Network**: Stable internet connection for Docker image pulls

### Backup and Recovery

Implement regular backup strategies for:
- **Database**: Use PostgreSQL backup tools like `pg_dump`
- **Application Code**: Maintain version control with Git
- **Configuration**: Backup environment files and Docker configurations

## Monitoring and Health Checks

### Health Check Endpoints

The application provides two health check endpoints:

1. **Basic Health Check**: `GET /health`
   ```json
   {
     "status": "healthy"
   }
   ```

2. **Protected Test Route**: `GET /api/protected` (requires authentication)
   ```json
   {
     "success": true,
     "message": "You are authenticated!",
     "user": { /* user data */ }
   }
   ```

### Container Health Checks

Docker Compose can be configured with health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Security Considerations

### Production Security

Before deploying to production, ensure:

1. **JWT Secret**: Change the default JWT secret to a strong, random value
2. **Database Credentials**: Use strong, unique database credentials
3. **HTTPS**: Configure SSL/TLS for encrypted communication
4. **CORS**: Restrict CORS origins to trusted domains only
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Input Validation**: Validate and sanitize all user inputs
7. **Dependency Updates**: Regularly update dependencies to patch security vulnerabilities

### Network Security

- **Container Isolation**: Services are isolated within Docker networks
- **Port Exposure**: Only necessary ports are exposed to the host
- **Firewall**: Configure firewall rules to restrict access to only required ports

## Troubleshooting

### Common Issues

1. **Database Connection Failed**: 
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL container is running
   - Ensure network connectivity between containers

2. **Authentication Errors**:
   - Verify JWT_SECRET is consistent across deployments
   - Check cookie configuration for secure/production settings

3. **Ollama Connection Failed**:
   - Ensure Ollama is running on the host machine
   - Verify the host.docker.internal DNS resolution
   - Check firewall settings for port 11434

4. **Permission Denied**:
   - Check file permissions for mounted volumes
   - Verify user permissions for Docker commands

### Debugging

Enable debug logging by setting environment variables:
```env
DEBUG=*,-express:*,-body-parser:*,-send,-morgan
```

Check container logs:
```bash
docker-compose logs backend
docker-compose logs postgres
```

Access container shells for debugging:
```bash
docker-compose exec backend sh
docker-compose exec postgres sh
```