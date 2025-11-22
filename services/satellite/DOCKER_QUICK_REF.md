# Satellite MCP Server - Docker Quick Reference

Quick command reference for Docker deployment of Satellite MCP Server.

## Quick Start

```bash
# Start Satellite MCP server
cd /Users/rckdrigo/Projects/pulsar-interactive
docker-compose up -d satellite-mcp

# Test endpoints
curl http://localhost:33000/health
./satellite/test-docker-http.sh
```

## Common Commands

### Build & Start

```bash
# Build image
docker build -t satellite-mcp:latest ./satellite

# Start with docker-compose (recommended)
docker-compose up -d satellite-mcp

# Start standalone
docker run -d --name satellite-mcp -p 33000:33000 satellite-mcp:latest

# Rebuild and restart
docker-compose up -d --build satellite-mcp
```

### Logs & Debugging

```bash
# View real-time logs
docker logs -f satellite-mcp

# View last 50 lines
docker logs --tail 50 satellite-mcp

# View logs with timestamps
docker logs -t satellite-mcp

# Enable debug mode
docker-compose up -d satellite-mcp -e DEBUG=mcp:*
```

### Status & Health

```bash
# Check container status
docker ps --filter name=satellite-mcp

# Check health status
docker inspect satellite-mcp --format='{{.State.Health.Status}}'

# View health check logs
docker inspect satellite-mcp | jq '.[0].State.Health'

# Test health endpoint
curl http://localhost:33000/health
```

### Execute Commands

```bash
# Open shell in container
docker exec -it satellite-mcp sh

# Run command in container
docker exec satellite-mcp node --version

# Test internal endpoint
docker exec satellite-mcp wget -qO- http://localhost:33000/health

# Check environment variables
docker exec satellite-mcp printenv | grep MCP
```

### Stop & Cleanup

```bash
# Stop container
docker-compose stop satellite-mcp

# Stop and remove container
docker-compose down satellite-mcp

# Remove container (keep image)
docker rm -f satellite-mcp

# Remove image
docker rmi satellite-mcp:latest

# Full cleanup (containers, images, volumes)
docker-compose down -v --rmi all
```

## Testing Endpoints

### Health Check (no auth)

```bash
curl http://localhost:33000/health
```

### List Tools (with auth)

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Get Current Date (with auth)

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get-current-date",
      "arguments": { "timezone": "America/New_York" }
    }
  }'
```

### Pulsar Health Check (with auth)

```bash
curl -X POST http://localhost:33000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-sat-mcp-2024-secure-development-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "pulsar-health",
      "arguments": { "includeDetails": true }
    }
  }'
```

## Environment Variables

Set in `.env` file or pass via `-e` flag:

```bash
# Core Configuration
TRANSPORT_MODE=http                                      # Always "http" for Docker
HTTP_PORT=33000                                          # Server port
NODE_ENV=production                                      # Environment

# Authentication
MCP_API_KEY=sk-sat-mcp-2024-secure-development-key      # API key for MCP endpoints
SATELLITE_API_KEY=${MCP_API_KEY}                        # Alias

# Pulsar Integration
PULSAR_SOCKET_URL=http://pulsar-backend:3000            # Pulsar API URL (Docker network)
PULSAR_API_KEY=your-pulsar-api-key                      # Pulsar auth key

# Debugging
DEBUG=mcp:*                                              # Enable MCP debug logging
```

## Networking

```bash
# List networks
docker network ls

# Inspect pulsar-network
docker network inspect pulsar-network

# Test connection to Pulsar from Satellite
docker exec satellite-mcp wget -qO- http://pulsar-backend:3000/api/v1/health

# Test connection from host
curl http://localhost:3000/api/v1/health
```

## Resource Management

```bash
# Monitor resource usage
docker stats satellite-mcp

# View disk usage
docker system df

# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs satellite-mcp

# Inspect container details
docker inspect satellite-mcp

# Check if port is already in use
lsof -i :33000

# Verify environment variables
docker exec satellite-mcp printenv
```

### Health check failing

```bash
# Check health status
docker inspect satellite-mcp | jq '.[0].State.Health'

# Test health endpoint manually
docker exec satellite-mcp wget -qO- http://localhost:33000/health

# Verify HTTP_PORT matches container port
docker exec satellite-mcp printenv HTTP_PORT
```

### Can't connect to Pulsar

```bash
# Verify Pulsar is running
docker ps --filter name=pulsar-backend

# Test connection from Satellite container
docker exec satellite-mcp wget -qO- http://pulsar-backend:3000/api/v1/health

# Check if both are on same network
docker network inspect pulsar-network | grep -A 5 satellite-mcp
docker network inspect pulsar-network | grep -A 5 pulsar-backend
```

### Authentication errors

```bash
# Verify API key is set
docker exec satellite-mcp printenv MCP_API_KEY

# Update API key
docker-compose up -d satellite-mcp -e MCP_API_KEY=new-key

# Disable auth for testing (development only)
docker-compose up -d satellite-mcp -e MCP_API_KEY=
```

## Integration with Pulsar Interactive

```bash
# Start full stack
docker-compose up -d

# Start only backend services
docker-compose up -d postgres redis pulsar-backend

# Start Satellite (depends on Pulsar)
docker-compose up -d satellite-mcp

# View all Pulsar services
docker ps --filter label=com.pulsar.service

# View Satellite metadata
docker inspect satellite-mcp --format='{{range .Config.Labels}}{{println .}}{{end}}'
```

## Useful Aliases

Add to your `.zshrc` or `.bashrc`:

```bash
# Satellite shortcuts
alias sat-logs='docker logs -f satellite-mcp'
alias sat-restart='docker-compose restart satellite-mcp'
alias sat-health='curl -s http://localhost:33000/health | jq'
alias sat-test='cd /Users/rckdrigo/Projects/pulsar-interactive/satellite && ./test-docker-http.sh'
alias sat-shell='docker exec -it satellite-mcp sh'

# Pulsar stack shortcuts
alias pulsar-up='cd /Users/rckdrigo/Projects/pulsar-interactive && docker-compose up -d'
alias pulsar-down='cd /Users/rckdrigo/Projects/pulsar-interactive && docker-compose down'
alias pulsar-logs='cd /Users/rckdrigo/Projects/pulsar-interactive && docker-compose logs -f'
```

## Production Deployment

```bash
# Generate secure API key
openssl rand -base64 32

# Update .env.production
echo "SATELLITE_API_KEY=$(openssl rand -base64 32)" >> .env.production

# Deploy with production config
docker-compose --env-file .env.production up -d satellite-mcp

# Verify deployment
curl -H "X-API-Key: YOUR_KEY" http://localhost:33000/mcp -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Documentation

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete Docker setup guide
- [README.md](./README.md) - Main documentation
- [CLAUDE.md](./CLAUDE.md) - Development guide
