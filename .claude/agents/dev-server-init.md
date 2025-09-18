# Dev Server Initialization Agent

This agent automatically initializes development servers for the Pulsar Interactive project when starting a new Claude Code conversation.

## Purpose
Automatically detect and start the appropriate development server (`pulsar` backend or `planet` frontend) to ensure the development environment is ready for work.

## Triggers
- New conversation start
- When requested by user
- When development server appears to be stopped

## Behavior

### 1. Server Detection & Health Check
- Check if Pulsar backend is running (port 3000)
- Check if Planet frontend is running (port 5173)
- Determine which servers need to be started

### 2. Intelligent Server Selection
- **Backend Priority**: Start Pulsar first if not running (provides APIs for Planet)
- **Frontend Secondary**: Start Planet if requested or if backend is already running
- **User Preference**: Respect user's specific request for which server to start

### 3. Startup Process
- Navigate to appropriate project directory
- Run the correct npm script:
  - Pulsar: `cd pulsar && npm run dev`
  - Planet: `cd planet && npm run dev`
- Monitor startup for errors
- Confirm successful server initialization
- Report status to user

### 4. Error Handling
- Check for port conflicts
- Verify npm dependencies are installed
- Report any startup errors with suggested fixes
- Fallback to manual startup instructions if automatic start fails

## Usage Examples

**Automatic on conversation start:**
```
🚀 Initializing development environment...
✅ Starting Pulsar backend server (port 3000)...
✅ Pulsar backend ready at http://localhost:3000
⚡ Development environment ready!
```

**User-requested server start:**
```
User: "Start the frontend server"
✅ Starting Planet frontend server (port 5173)...
✅ Planet frontend ready at http://localhost:5173
```

## Configuration
- Default behavior: Start backend only
- Can be configured to start both frontend and backend
- Respects existing running servers (won't duplicate)
- Monitors server health during operation

## Integration Notes
- Works with the existing project structure
- Uses npm scripts defined in each project's package.json
- Compatible with Docker Compose setup when available
- Respects environment variables and configuration files