# Satellite MCP Server - Docker Setup (HTTP Mode)

This guide explains how to build, run, and integrate the Satellite MCP Server as an HTTP-only service using Docker.

## Overview

The Satellite MCP Server can run in Docker using HTTP streaming transport, making it accessible to web-based clients and remote services. This is ideal for production deployments and integration with the Pulsar Interactive ecosystem.

**Key Features**:
- HTTP-only transport (no stdio dependency)
- RESTful API endpoints for MCP tool calls
- API key authentication for security
- Health check endpoint for monitoring
- Multi-stage build for optimized image size
- Integration with Pulsar backend via Docker network

## Quick Start

### 1. Build the Docker Image

From the `satellite/` directory:

```bash
# Build the image
docker build -t satellite-mcp:latest .

# Verify the build
docker images | grep satellite-mcp
```

### 2. Run as Standalone Container

```bash
docker run -d \
  --name satellite-mcp \
  -p 33000:8000 \
  -e TRANSPORT_MODE=http \
  -e HTTP_PORT=8000 \
  -e MCP_API_KEY=your-secure-api-key \
  -e PULSAR_SOCKET_URL=http://localhost:3000 \
  satellite-mcp:latest
```

### 3. Run with Docker Compose (Recommended)

The Satellite service is already configured in the main `docker-compose.yml`:

```bash
# From the pulsar-interactive root directory
cd /Users/rckdrigo/Projects/pulsar-interactive

# Start all services including Satellite
docker-compose up -d

# Or start only Satellite and its dependencies
docker-compose up -d satellite-mcp
```

## Configuration

### Environment Variables

Configure the following in your `.env` file or docker-compose.yml:

```bash
# Required - Transport Configuration
TRANSPORT_MODE=http                    # Always use "http" for Docker
HTTP_PORT=8000                         # Internal container port (default: 8000)

# Required - API Authentication
SATELLITE_API_KEY=sk-sat-mcp-2024-secure-development-key  # MCP server API key
MCP_API_KEY=${SATELLITE_API_KEY}       # Same as SATELLITE_API_KEY

# Required - Pulsar Integration
PULSAR_SOCKET_URL=http://pulsar-backend:3000  # Pulsar API endpoint (use service name in Docker)
PULSAR_API_KEY=your-pulsar-api-key            # Pulsar authentication key

# Optional - Debugging
DEBUG=mcp:*                            # Enable detailed MCP protocol logging

# Optional - Node Environment
NODE_ENV=production                    # Set to "development" for verbose logging
```

### Docker Compose Configuration

The service is defined in `/Users/rckdrigo/Projects/pulsar-interactive/docker-compose.yml`:

```yaml
satellite-mcp:
  build:
    context: ./satellite
    dockerfile: Dockerfile
  container_name: satellite-mcp
  restart: unless-stopped
  environment:
    - NODE_ENV=${NODE_ENV:-production}
    - TRANSPORT_MODE=http
    - HTTP_PORT=33000
    - HTTP_HOST=0.0.0.0
    - MCP_API_KEY=${SATELLITE_API_KEY:-sk-sat-mcp-2024-secure-development-key}
    - PULSAR_SOCKET_URL=http://pulsar-backend:3000
    - PULSAR_API_KEY=${API_KEY:-your-api-key-here}
    - DEBUG=${DEBUG:-}
  ports:
    - "${SATELLITE_HTTP_PORT:-33000}:33000"
  networks:
    - pulsar-network
  depends_on:
    pulsar-backend:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:33000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
```

**Port Mapping Note**:
- Container internal port: `33000` (configured via `HTTP_PORT=33000`)
- Host external port: `33000` (configurable via `SATELLITE_HTTP_PORT` in `.env`)

## API Endpoints

Once running, the server exposes the following endpoints:

### Health Check
```bash
# Check server health (no authentication required)
curl http://localhost:33000/health

# Response:
{
  "status": "ok",
  "message": "Satellite MCP Server HTTP transport is running",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### MCP Tool Calls
```bash
# Call MCP tools (requires authentication)
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get-current-date",
      "arguments": { "timezone": "America/New_York" }
    }
  }'
```

### Authentication

The server supports two authentication methods:

1. **X-API-Key Header** (recommended):
   ```bash
   -H "X-API-Key: your-api-key"
   ```

2. **Authorization Bearer Token**:
   ```bash
   -H "Authorization: Bearer your-api-key"
   ```

If `MCP_API_KEY` is not set, the server runs in **development mode** (no authentication required).

## Docker Commands

### Building and Running

```bash
# Build the image
docker build -t satellite-mcp:latest ./satellite

# Run the container
docker run -d \
  --name satellite-mcp \
  --network pulsar-network \
  -p 33000:33000 \
  -e TRANSPORT_MODE=http \
  -e HTTP_PORT=33000 \
  -e MCP_API_KEY=your-api-key \
  satellite-mcp:latest

# View logs
docker logs -f satellite-mcp

# Check health
docker exec satellite-mcp wget -qO- http://localhost:33000/health

# Stop and remove
docker stop satellite-mcp
docker rm satellite-mcp
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start only Satellite
docker-compose up -d satellite-mcp

# View logs
docker-compose logs -f satellite-mcp

# Restart Satellite
docker-compose restart satellite-mcp

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build satellite-mcp
```

## Health Checks

The Docker container includes a health check that runs every 30 seconds:

```bash
# Check container health status
docker ps --filter name=satellite-mcp

# View health check logs
docker inspect satellite-mcp | jq '.[0].State.Health'
```

## Integration with Pulsar Interactive

### Network Configuration

The Satellite service connects to Pulsar backend via the `pulsar-network` Docker network:

```yaml
networks:
  - pulsar-network
```

This allows Satellite to communicate with:
- **pulsar-backend** (port 3000) - API and health checks
- **postgres** (port 5432) - Database (if needed in future)
- **redis** (port 6379) - Cache (if needed in future)

### Service Dependencies

Satellite waits for Pulsar backend to be healthy before starting:

```yaml
depends_on:
  pulsar-backend:
    condition: service_healthy
```

## Testing the HTTP Server

### 1. Health Check

```bash
# Test health endpoint
curl http://localhost:33000/health

# Expected response
{
  "status": "ok",
  "message": "Satellite MCP Server HTTP transport is running",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### 2. Tool Call - Get Current Date

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get-current-date",
      "arguments": { "timezone": "America/New_York" }
    }
  }'
```

### 3. Tool Call - Pulsar Health

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "pulsar-health",
      "arguments": { "includeDetails": true }
    }
  }'
```

### 4. List Available Tools

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/list"
  }'
```

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker logs satellite-mcp

# Common issues:
# 1. Port already in use - change SATELLITE_HTTP_PORT in .env
# 2. Missing environment variables - check .env file
# 3. Pulsar backend not healthy - check pulsar-backend status
```

### Authentication Errors

```bash
# Verify API key is set correctly
docker exec satellite-mcp printenv | grep MCP_API_KEY

# If missing, update .env and restart:
docker-compose restart satellite-mcp
```

### Network Connection Issues

```bash
# Verify network exists
docker network ls | grep pulsar-network

# Check if services are on the same network
docker network inspect pulsar-network

# Test connection to Pulsar from Satellite
docker exec satellite-mcp wget -qO- http://pulsar-backend:3000/api/v1/health
```

### Health Check Failures

```bash
# View health check logs
docker inspect satellite-mcp | jq '.[0].State.Health'

# Manually test health endpoint inside container
docker exec satellite-mcp wget -qO- http://localhost:33000/health

# If failing, check if HTTP_PORT environment variable matches exposed port
```

## Production Deployment

### Security Recommendations

1. **Use Strong API Keys**:
   ```bash
   # Generate secure API key
   openssl rand -base64 32

   # Set in .env
   SATELLITE_API_KEY=<generated-key>
   ```

2. **Enable HTTPS** (via reverse proxy like Nginx or Traefik):
   ```nginx
   server {
       listen 443 ssl;
       server_name satellite.pulsarinteractive.xyz;

       location / {
           proxy_pass http://localhost:33000;
           proxy_set_header X-API-Key $http_x_api_key;
       }
   }
   ```

3. **Restrict Network Access**:
   - Use Docker network isolation
   - Configure firewall rules
   - Limit exposed ports

4. **Monitor Logs**:
   ```bash
   # Enable debug logging temporarily
   docker-compose up -d satellite-mcp -e DEBUG=mcp:*

   # View real-time logs
   docker-compose logs -f satellite-mcp
   ```

### Environment-Specific Configuration

Create environment-specific .env files:

```bash
# .env.production
NODE_ENV=production
SATELLITE_API_KEY=<production-key>
PULSAR_SOCKET_URL=http://pulsar-backend:3000
DEBUG=

# .env.staging
NODE_ENV=staging
SATELLITE_API_KEY=<staging-key>
PULSAR_SOCKET_URL=http://staging-pulsar-backend:3000
DEBUG=mcp:*
```

Load with:
```bash
docker-compose --env-file .env.production up -d satellite-mcp
```

## Next Steps

1. **Test Tool Integration**: Use the test script to verify all tools work correctly
   ```bash
   ./test-mcp-connection.sh
   ```

2. **Monitor Performance**: Check resource usage and logs
   ```bash
   docker stats satellite-mcp
   docker-compose logs -f satellite-mcp
   ```

3. **Add Custom Tools**: Follow CLAUDE.md to add new MCP tools to the server

4. **Integration**: Connect your web application or Claude Code client to `http://localhost:33000/mcp`

## References

- [MCP Setup Guide](./MCP-SETUP.md) - Local development setup
- [Local Development Guide](./LOCAL_DEV.md) - Development workflow
- [CLAUDE.md](./CLAUDE.md) - Architecture and tool development
- [Pulsar Integration](./PULSAR_INTEGRATION.md) - Pulsar backend integration details
