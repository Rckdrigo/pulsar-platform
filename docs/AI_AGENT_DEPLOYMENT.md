# AI Agent Integration - Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the AI Agent integration with Claude Anthropic in the Pulsar Interactive server. The integration adds intelligent AI agents to your chat system with both REST API and WebSocket capabilities.

## 🏗️ System Architecture

### Component Stack
```
Client (WebSocket/HTTP)
    ↓
ChatService / AIAgentController
    ↓
AIAgentProvider (Business Logic)
    ↓
AIAgentService (Claude Integration)
    ↓
AIAgentModel (Data Layer)
    ↓
Claude API / PostgreSQL
```

### Modules Added
- **AIAgentService** (`src/services/aiAgent.js`) - Claude API integration
- **AIAgentProvider** (`src/providers/aiAgent.js`) - Business logic layer
- **AIAgentController** (`src/controllers/aiAgent.js`) - REST endpoints
- **AIAgentModel** (`src/models/aiAgent.js`) - Data persistence
- **AIAgentRouter** (`src/routers/aiAgent.js`) - Route definitions
- **Database Migrations** - 5 new tables for AI data

## 🚀 Deployment Requirements

### Required Environment Variables

```bash
# AI Services Configuration (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-anthropic-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=1024

# Database Configuration
HAS_DB=true
DATABASE_URL=postgresql://user:password@host:port/database

# CORS Configuration for Production
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
SOCKET_CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_CREDENTIALS=true

# Standard Production Settings
NODE_ENV=production
PORT=3000
```

### Dependencies Added
- `@anthropic-ai/sdk@^0.63.0` - Official Anthropic SDK

## 🗄️ Database Setup

### Migration Files Created
1. `007_create_ai_agents_table.sql` - Agent configurations
2. `008_create_ai_conversations_table.sql` - Conversation tracking
3. `009_create_ai_agent_messages_table.sql` - Message storage
4. `010_create_ai_usage_metrics_table.sql` - Analytics
5. `011_seed_default_ai_agents.sql` - Default agents

### Database Options

**PostgreSQL (Recommended for Production):**
```bash
# Migrations run automatically when NODE_ENV=production
# Or manually run:
npm run migrate
```

**In-Memory Storage (Development/Testing):**
- Set `HAS_DB=false` or omit DATABASE_URL
- Data persists only during server uptime
- Suitable for development and testing

## 📡 API Endpoints

### REST API Routes
- `GET /api/v1/agents` - List all active agents
- `GET /api/v1/agents/health` - AI service health check
- `GET /api/v1/agents/type/:type` - Get agents by type
- `GET /api/v1/agents/:id` - Get specific agent details
- `POST /api/v1/agents/:id/message` - Send message to agent
- `GET /api/v1/agents/conversations/:id` - Get conversation history
- `DELETE /api/v1/agents/conversations/:id` - Clear conversation
- `POST /api/v1/agents` - Create new agent (admin)
- `PUT /api/v1/agents/:id` - Update agent (admin)
- `DELETE /api/v1/agents/:id` - Deactivate agent (admin)

### WebSocket Events

**Client → Server:**
- `agent_message` - Direct message to specific agent
- `get_agents` - Request available agents list
- `send_message` - Regular chat (supports @agent mentions)
- `agent_typing` - Typing indicator management

**Server → Client:**
- `agent_response` - Complete agent response
- `agent_message_chunk` - Streaming response chunks
- `agent_typing_start/end` - Typing indicators
- `agents_list` - Available agents response
- `agent_error` - Error responses
- `message` - Regular chat messages (includes agent responses)

## 🐳 Docker Deployment

### Dockerfile Additions
No changes required to existing Dockerfile. The AI integration uses the same build process.

### docker-compose.yml Example
```yaml
version: '3.8'
services:
  pulsar:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - HAS_DB=true
      - DATABASE_URL=postgresql://user:pass@db:5432/pulsar
      - CORS_ORIGIN=https://yourdomain.com
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pulsar
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deployment Commands
```bash
# 1. Set environment variables
export ANTHROPIC_API_KEY=your-key

# 2. Deploy with Docker Compose
docker-compose up -d

# 3. Check logs
docker-compose logs -f pulsar
```

## ☁️ Cloud Platform Deployment

### Railway/Render/Heroku
```bash
# 1. Set environment variables in platform dashboard
ANTHROPIC_API_KEY=sk-ant-api03-your-key
NODE_ENV=production
HAS_DB=true

# 2. Add PostgreSQL add-on
# 3. Deploy from Git repository
# 4. Migrations run automatically on first deploy
```

### VPS/AWS/GCP/Azure
```bash
# 1. Clone repository
git clone https://github.com/your-repo/pulsar-interactive.git
cd pulsar-interactive/pulsar

# 2. Install dependencies
npm ci --only=production

# 3. Set environment variables
export ANTHROPIC_API_KEY=your-key
export NODE_ENV=production
export DATABASE_URL=your-postgres-url

# 4. Build and start
npm run build
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/app.js --name pulsar-ai
pm2 save
pm2 startup
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pulsar-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pulsar-ai
  template:
    metadata:
      labels:
        app: pulsar-ai
    spec:
      containers:
      - name: pulsar
        image: your-registry/pulsar-ai:latest
        ports:
        - containerPort: 3000
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: anthropic-key
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
```

## 🔒 Security Configuration

### API Key Management
```bash
# NEVER commit API keys to version control
# Use environment variables or secrets management

# For development
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local

# For production (platform-specific)
# Railway: Environment Variables tab
# Heroku: heroku config:set ANTHROPIC_API_KEY=sk-ant-...
# Docker: -e ANTHROPIC_API_KEY=sk-ant-...
# Kubernetes: kubectl create secret generic ai-secrets --from-literal=anthropic-key=sk-ant-...
```

### Rate Limiting Configuration
The system includes built-in rate limiting:
- WebSocket: 30 messages per minute per socket
- REST API: Configurable via middleware
- Agent-specific: Rate limits apply to AI interactions

### CORS Configuration
```javascript
// Production CORS settings
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
```

## 📊 Monitoring & Observability

### Health Check Endpoint
```bash
curl https://yourdomain.com/api/v1/health
```

Returns AI service status including:
- Agent service initialization status
- Active agent count
- Service uptime
- Error states

### Logging
The integration uses your existing Pino logger:
```javascript
// AI-specific log contexts
logger.info('Agent message processed', {
    agentId,
    userId,
    messageLength,
    tokens_used,
    processing_time,
    cost_estimate
})
```

### Metrics Tracking
Built-in usage metrics include:
- Token consumption per agent/user
- Processing times
- Success/failure rates
- Conversation patterns
- Cost estimation

## 💰 Cost Management

### Token Usage Monitoring
```sql
-- Query usage metrics
SELECT
    agent_id,
    SUM(tokens_used) as total_tokens,
    COUNT(*) as message_count,
    AVG(processing_time_ms) as avg_response_time
FROM ai_usage_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY agent_id;
```

### Cost Optimization
- Monitor token usage via built-in metrics
- Set up alerts for high usage patterns
- Consider caching common responses
- Implement user-based usage limits

## 🧪 Testing Deployment

### Health Check
```bash
# Test server health
curl -X GET http://localhost:3000/api/v1/health

# Expected response includes AI service status
{
  "status": "healthy",
  "ai_service": {
    "status": "operational",
    "agents_loaded": 5,
    "initialized": true
  }
}
```

### API Testing
```bash
# Test agent listing
curl -X GET http://localhost:3000/api/v1/agents

# Test agent messaging
curl -X POST http://localhost:3000/api/v1/agents/code-assistant/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me?"}'
```

### WebSocket Testing
```javascript
// Test WebSocket connection
const socket = io('ws://localhost:3000');

socket.emit('get_agents');
socket.on('agents_list', (data) => {
    console.log('Available agents:', data.agents);
});

socket.emit('agent_message', {
    agentId: 'code-assistant',
    message: 'Test message'
});
```

## 🚨 Troubleshooting

### Common Issues

**1. "Service 'services.aiAgent' not found"**
```bash
# Solution: Ensure services configuration is added
# Check: src/config/services.js includes services namespace
```

**2. "Invalid import in PROVIDER aiAgent"**
```bash
# Solution: Provider uses dependency injection pattern
# The provider should not directly import services
```

**3. "AI Agent Service not initialized"**
```bash
# Check: ANTHROPIC_API_KEY is set correctly
# Check: Environment variables are loaded
# Check: Service initialization logs
```

**4. WebSocket connections failing**
```bash
# Check: CORS configuration for WebSocket
# Check: Hosting platform supports WebSocket
# Check: Firewall/proxy settings
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check specific component logs
DEBUG=ai:* npm start
```

## 🔄 Rollback Plan

### Quick Rollback
```bash
# 1. Revert to previous deployment
git checkout previous-stable-commit

# 2. Rebuild and deploy
npm run build
npm start

# 3. Database rollback (if needed)
# Migrations are backwards compatible
# No immediate rollback required
```

### Gradual Migration
```bash
# 1. Set HAS_DB=false to use in-memory storage
# 2. Deploy without database dependencies
# 3. Test AI functionality
# 4. Enable database when ready
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Anthropic API key obtained and secured
- [ ] Environment variables configured
- [ ] Database connection tested (if using PostgreSQL)
- [ ] CORS settings configured for production domain
- [ ] Rate limiting settings reviewed
- [ ] Monitoring/alerting configured

### Deployment
- [ ] Code deployed to production environment
- [ ] Database migrations executed
- [ ] Environment variables set
- [ ] Application started successfully
- [ ] Health checks passing

### Post-Deployment
- [ ] API endpoints responding correctly
- [ ] WebSocket connections working
- [ ] Agent creation/messaging functional
- [ ] Logging and metrics collection active
- [ ] Performance monitoring in place
- [ ] Cost tracking enabled

## 📞 Support & Maintenance

### Regular Maintenance
- Monitor token usage and costs
- Review agent performance metrics
- Update agent system prompts as needed
- Scale infrastructure based on usage patterns

### Updates
- Keep @anthropic-ai/sdk updated
- Monitor Claude API model updates
- Review and update rate limiting as needed
- Regular security updates

---

**Deployment completed successfully. The AI agent integration is now ready for production use with full WebSocket and REST API capabilities.**