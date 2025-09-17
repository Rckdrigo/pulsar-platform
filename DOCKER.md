# Docker Compose Setup for Pulsar Interactive

This repository includes a complete Docker Compose setup for running both the Pulsar backend and Planet frontend services.

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit environment variables in `.env` as needed**

3. **Build and start services:**
   ```bash
   # Production mode
   docker-compose up -d

   # Development mode (uses override file automatically)
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
   ```

4. **Access the applications:**
   - Planet Frontend: http://localhost (or configured PLANET_PORT)
   - Pulsar Backend: http://localhost:3000 (or configured PULSAR_PORT)

## Services

### Pulsar Backend
- **Container**: `pulsar-backend`
- **Build**: Uses existing `pulsar/Dockerfile`
- **Port**: 3000 (configurable via `PULSAR_PORT`)
- **Health Check**: `/api/v1/health` endpoint
- **Networks**: `pulsar-network`

### Planet Frontend
- **Container**: `planet-frontend`
- **Build**: Multi-stage build with nginx
- **Port**: 80 (configurable via `PLANET_PORT`)
- **Health Check**: `/health` endpoint
- **Networks**: `pulsar-network`
- **Proxy**: Automatically proxies `/api` and `/socket.io` to backend

## Environment Configuration

### Production Variables
```bash
NODE_ENV=production
PULSAR_PORT=3000
PLANET_PORT=80
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WEBSOCKET_URL=https://api.yourdomain.com
```

### Development Variables
```bash
NODE_ENV=development
PULSAR_PORT=3000
PLANET_PORT=5173
VITE_API_BASE_URL=http://localhost:3000
VITE_WEBSOCKET_URL=http://localhost:3000
```

## Development Mode

The development override file (`docker-compose.override.yml`) provides:
- Source code mounting for live reload
- Development-specific environment variables
- Debug port exposure for Node.js (9229)
- Vite dev server for frontend

```bash
# Start in development mode
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build
```

## Production Deployment

For production deployment:

1. **Set production environment variables**
2. **Disable override file:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```
3. **Configure reverse proxy/SSL termination as needed**

## Configuration Management

### Planet Configuration
Planet uses a YAML configuration system with API-first loading:
- **Template**: `planet/public/config.template.yml`
- **Runtime**: Generated from template with environment variable substitution
- **API Fallback**: Loads from Pulsar API when available

### Environment Variable Substitution
The Planet container automatically generates `config.yml` from `config.template.yml` using environment variables:
```yaml
api:
  baseUrl: ${VITE_API_BASE_URL}
websocket:
  url: ${VITE_WEBSOCKET_URL}
```

## Networking

- **Internal Network**: `pulsar-network` (bridge)
- **Service Discovery**: Services communicate using container names
- **API Proxy**: Planet nginx proxies API calls to `pulsar-backend:3000`
- **WebSocket Proxy**: Socket.IO connections proxied with upgrade support

## Health Checks

Both services include comprehensive health checks:
- **Pulsar**: HTTP GET to `/api/v1/health`
- **Planet**: HTTP GET to `/health`
- **Intervals**: 30s with 3 retries
- **Dependencies**: Planet waits for Pulsar to be healthy

## Volumes

- **pulsar-logs**: Persistent log storage for Pulsar backend
- **Development**: Source code mounted for live reload

## Commands

```bash
# Build services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# Run commands in containers
docker-compose exec pulsar-backend npm test
docker-compose exec planet-frontend sh
```

## Security Features

### Planet (nginx)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Static asset caching with immutable cache control
- Config file cache prevention
- Gzip compression

### Pulsar
- Non-root user execution
- Production dependency installation only
- Health check monitoring

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports are already in use
2. **Permission issues**: Ensure Docker has proper permissions
3. **Build failures**: Check for missing dependencies in package.json
4. **API connectivity**: Verify network configuration and health checks

### Debug Commands
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs pulsar-backend
docker-compose logs planet-frontend

# Inspect networks
docker network ls
docker network inspect pulsar-network

# Check container health
docker-compose exec pulsar-backend curl http://localhost:3000/api/v1/health
docker-compose exec planet-frontend wget -qO- http://localhost/health
```

### Development Debugging
```bash
# Connect to development containers
docker-compose exec pulsar-backend sh
docker-compose exec planet-frontend sh

# Check environment variables
docker-compose exec pulsar-backend env
docker-compose exec planet-frontend env
```

## File Structure

```
.
├── docker-compose.yml           # Main compose file
├── docker-compose.override.yml  # Development overrides
├── .env.example                 # Environment template
├── pulsar/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore
├── planet/
│   ├── Dockerfile              # Frontend container
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore
└── DOCKER.md                   # This file
```