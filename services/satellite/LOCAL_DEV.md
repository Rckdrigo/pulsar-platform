# Local Development Guide

Quick reference for running Pulsar and Satellite locally for development.

## Prerequisites

- Node.js v22.x installed
- Both services have dependencies installed (`npm install`)
- Pulsar backend running on port 3000

## Starting Services

### Option A: HTTP Mode (with MCP Inspector)

Best for testing tools via web interface and debugging.

```bash
# Terminal 1: Start Pulsar Backend
cd ~/Projects/pulsar-interactive/pulsar
npm run dev

# Terminal 2: Start Satellite with HTTP transport + Inspector
cd ~/Projects/pulsar-interactive/satellite
npm run dev:http
```

**Access Points**:
- MCP Inspector: `http://localhost:5173`
- Satellite HTTP endpoint: `http://localhost:8000/mcp`
- Satellite health check: `http://localhost:8000/health`
- Pulsar API: `http://localhost:3000/api/v1/health`

### Option B: Stdio Mode (Claude Desktop Integration)

Best for direct integration with Claude Desktop.

```bash
# Terminal 1: Start Pulsar Backend
cd ~/Projects/pulsar-interactive/pulsar
npm run dev

# Satellite runs automatically when Claude Desktop connects
# Configured via .mcp.json stdio transport
```

**Claude Desktop Configuration** (`.mcp.json`):
```json
{
  "mcpServers": {
    "satellite": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/Users/rckdrigo/Projects/pulsar-interactive/satellite/src/server.ts"
      ],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

## Available Tools

### pulsar-health
Monitors Pulsar backend health status.

**Parameters**:
- `includeDetails` (boolean, optional) - Get detailed health information

**Example** (via MCP Inspector):
```json
{
  "includeDetails": true
}
```

### File Management Tools

All file operations are restricted to: `/Users/rckdrigo/Projects/pulsar-interactive`

**Available tools**:
- `file-read` - Read file contents
- `file-write` - Create or overwrite files (dry-run by default)
- `file-delete` - Delete files/directories (dry-run by default)
- `file-list` - List directory contents
- `file-search` - Search files using glob patterns
- `file-move` - Move or rename files (dry-run by default)
- `file-copy` - Copy files (dry-run by default)
- `file-stats` - Get file/directory information

### get-current-date
Get current date/time with timezone support.

**Parameters**:
- `timezone` (string, optional) - IANA timezone (e.g., 'America/New_York')

## Health Checks

### Check Pulsar Backend
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "pulsar",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check Satellite HTTP Server
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Satellite MCP Server HTTP transport is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Switching Transport Modes

### Switch to HTTP Mode
Update `.env`:
```bash
TRANSPORT_MODE=http
HTTP_PORT=8000
```

Then run:
```bash
npm run dev:http
```

### Switch to Stdio Mode
Update `.env`:
```bash
TRANSPORT_MODE=stdio
```

Then run:
```bash
npm run dev
```

Or connect directly via Claude Desktop (stdio transport is automatic).

## Environment Variables

Key variables in `.env`:

```bash
# Environment
NODE_ENV=development

# Transport Mode
TRANSPORT_MODE=http              # Options: "stdio" or "http"
HTTP_PORT=8000                   # Port for HTTP transport

# MCP Server Authentication
MCP_API_KEY=sk-sat-mcp-2024-secure-development-key

# Pulsar Integration
PULSAR_SOCKET_URL=http://localhost:3000
PULSAR_API_KEY=dev-pulsar-interactive-key-2024

# File Manager Security
FILE_MANAGER_BASE_PATH=/Users/rckdrigo/Projects/pulsar-interactive

# Debug Logging (optional)
# DEBUG=mcp:*
```

## Testing Tools

### Run Tests
```bash
npm test                 # Run all tests
npm test:coverage        # Run tests with coverage
```

### Test pulsar-health Tool
Using MCP Inspector at `http://localhost:5173`:
1. Select "pulsar-health" from tools list
2. Set parameters: `{ "includeDetails": true }`
3. Click "Call Tool"
4. View response with health status

### Test File Manager Tools
Using MCP Inspector:
1. Select "file-list" tool
2. Set parameters: `{ "path": ".", "showHidden": false }`
3. Verify files are restricted to base path
4. Try `file-read` on a known file

## Troubleshooting

### Pulsar Not Responding
```bash
# Check if Pulsar is running
curl http://localhost:3000/api/v1/health

# Check for port conflicts
lsof -i :3000

# Restart Pulsar
cd ~/Projects/pulsar-interactive/pulsar
npm run dev
```

### Satellite Connection Errors
```bash
# Verify environment variables
cat .env

# Check Pulsar URL is correct
echo $PULSAR_SOCKET_URL

# Test with debug logging
DEBUG=mcp:* npm run dev:http
```

### File Manager Permission Errors
- Ensure `FILE_MANAGER_BASE_PATH` is set in `.env`
- Verify you have read/write permissions to the base path
- Check that requested paths are within the base path

### MCP Inspector Not Loading
```bash
# Check if port 5173 is available
lsof -i :5173

# Try restarting with clean install
npm install
npm run dev:http
```

## Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| Pulsar Backend | 3000 | REST API & WebSocket |
| Satellite HTTP | 8000 | MCP HTTP transport |
| MCP Inspector | 5173 | Web-based tool testing |
| PostgreSQL | 5433 | Database (local dev) |
| Redis | 6380 | Cache (local dev) |

## Development Workflow

**Typical workflow**:
1. Start Pulsar: `cd pulsar && npm run dev`
2. Start Satellite: `cd satellite && npm run dev:http`
3. Open MCP Inspector: `http://localhost:5173`
4. Test tools via Inspector interface
5. Make changes to tool code
6. Restart Satellite to see changes
7. Re-test via Inspector

**For Claude Desktop testing**:
1. Start Pulsar: `cd pulsar && npm run dev`
2. Configure `.mcp.json` with stdio transport
3. Restart Claude Desktop
4. Test tools directly in conversation

## Additional Resources

- **Satellite Documentation**: `CLAUDE.md` - Comprehensive development guide
- **Pulsar Integration**: `PULSAR_INTEGRATION.md` - Integration details
- **README**: Quick start and installation
- **Parent CLAUDE.md**: Multi-project ecosystem overview
