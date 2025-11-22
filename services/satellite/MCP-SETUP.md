# Satellite MCP Server Setup Guide

This document explains how to use the Satellite MCP server with Claude Code CLI and Claude Desktop.

## Available Transport Modes

The Satellite MCP server supports two transport modes:

### 1. Stdio Transport (Recommended for Claude Desktop & CLI)
- Direct process-based communication
- Lower latency
- Better integration with Claude applications
- **Already configured in Claude Desktop**

### 2. HTTP Transport (For Web Clients)
- REST-based communication over HTTP
- Can be accessed remotely
- Port: 8000 (configurable via `HTTP_PORT` env var)
- **Experimental** - Use stdio for production

## Current Setup Status

### ✅ Claude Desktop Configuration
Your Claude Desktop is configured with the Satellite MCP server using stdio transport.

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "satellite": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/rckdrigo/Projects/pulsar-interactive/satellite/src/server.ts"],
      "env": {
        "DEBUG": "mcp:*",
        "TRANSPORT_MODE": "stdio",
        "PULSAR_SOCKET_URL": "${PULSAR_SOCKET_URL:-http://localhost:3000}",
        "PULSAR_API_KEY": "${PULSAR_API_KEY:-dev-pulsar-interactive-key-2024}",
        "FILE_MANAGER_BASE_PATH": "${FILE_MANAGER_BASE_PATH:-/Users/rckdrigo/Projects/pulsar-interactive}"
      }
    }
  }
}
```

**Note**: This configuration is kept in sync with Claude Code using the sync agent (see below).

### ✅ Claude Code CLI Configuration

**Project-level** (`.mcp.json`):
```json
{
  "mcpServers": {
    "satellite": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "tsx", "/Users/rckdrigo/Projects/pulsar-interactive/satellite/src/server.ts"],
      "env": {
        "DEBUG": "mcp:*",
        "TRANSPORT_MODE": "stdio",
        "PULSAR_SOCKET_URL": "${PULSAR_SOCKET_URL:-http://localhost:3000}",
        "FILE_MANAGER_BASE_PATH": "${FILE_MANAGER_BASE_PATH:-/Users/rckdrigo/Projects/pulsar-interactive}"
      }
    }
  }
}
```

**User-level** (added via CLI):
```bash
claude mcp add satellite-http http://localhost:8000/mcp \\
  -t http \\
  -H "Authorization: Bearer sk-sat-mcp-2024-secure-development-key"
```

## Using the MCP Server

### In Claude Desktop
The Satellite MCP server tools are automatically available:
- `pulsar-health` - Check Pulsar backend health
- `get-current-date` - Get current date/time with timezone support
- `file-read`, `file-write`, `file-delete`, `file-list`, `file-search`, `file-move`, `file-copy`, `file-stats` - File management tools

### In Claude Code CLI

#### List Available MCP Servers
```bash
claude mcp list
```

#### Get Server Details
```bash
claude mcp get satellite
```

#### Using Tools in Conversation
Simply mention what you need, and Claude will use the appropriate MCP tools:
- "Check if Pulsar is healthy"
- "What's the current time in New York?"
- "Read the config file"
- "List files in the src directory"

## Testing the Setup

### Test Stdio Mode (Recommended)
The stdio transport works automatically when Claude Code or Claude Desktop calls it.

To verify in Claude Code:
```bash
claude mcp list
```

Should show:
```
✓ satellite: stdio - Connected
```

### Test HTTP Mode
Start the HTTP server:
```bash
cd /Users/rckdrigo/Projects/pulsar-interactive/satellite
npm run start:http
```

Check health endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Satellite MCP Server HTTP transport is running",
  "timestamp": "2025-11-10T..."
}
```

## Available Tools

### 1. pulsar-health
Check Pulsar backend API health status.

**Parameters**:
- `includeDetails` (boolean, optional) - Get detailed health information

**Example**:
```
"Check Pulsar health with details"
```

### 2. get-current-date
Get current date and time with timezone support.

**Parameters**:
- `timezone` (string, optional) - IANA timezone (e.g., "America/New_York")

**Example**:
```
"What time is it in Tokyo?"
```

### 3. File Management Tools

**file-read** - Read file contents
**file-write** - Create or update files (dry-run by default)
**file-delete** - Delete files/directories (dry-run by default)
**file-list** - List directory contents
**file-search** - Search files using glob patterns
**file-move** - Move or rename files (dry-run by default)
**file-copy** - Copy files (dry-run by default)
**file-stats** - Get file/directory information

**Examples**:
```
"Read the package.json file"
"List all TypeScript files in src"
"Show me stats for the README.md file"
```

## Configuration Sync Agent

The Satellite MCP server includes an automated sync agent to keep Claude Desktop and Claude Code configurations synchronized.

### Using the Sync Agent

**Check if configurations are in sync** (dry-run mode):
```bash
npm run config:sync
# or
npm run config:check
```

**Apply configuration sync**:
```bash
npm run config:sync:apply
```

### What the Sync Agent Does

1. **Reads** both Claude Desktop and Claude Code configurations
2. **Compares** them against the canonical configuration
3. **Creates backups** before making any changes (timestamped)
4. **Updates** both configurations to match
5. **Reports** what changed and next steps

### Canonical Configuration

Both configurations are synchronized to include:
- **Server path**: Absolute path to `src/server.ts`
- **Transport mode**: `stdio` for both applications
- **Environment variables**:
  - `DEBUG=mcp:*` - Enable MCP protocol debugging
  - `TRANSPORT_MODE=stdio` - Use stdio transport
  - `PULSAR_SOCKET_URL` - Pulsar backend URL (default: `http://localhost:3000`)
  - `PULSAR_API_KEY` - API key for authentication (default: dev key)
  - `FILE_MANAGER_BASE_PATH` - Base path for file operations (default: pulsar-interactive directory)

### When to Run the Sync Agent

- After updating the satellite server path
- When environment variables change
- After making manual changes to either configuration
- When troubleshooting MCP connection issues
- To verify both applications have consistent settings

### Example Output

```bash
$ npm run config:sync

🛰️  Satellite MCP Configuration Sync Agent

Server Path: /Users/rckdrigo/Projects/pulsar-interactive/satellite/src/server.ts
Claude Desktop Config: ~/Library/Application Support/Claude/claude_desktop_config.json
Claude Code Config: /Users/rckdrigo/Projects/pulsar-interactive/satellite/.mcp.json

✓ Claude Desktop config is up to date
✓ Claude Code config is up to date

✅ Configuration sync complete!
```

## Configuration

### Environment Variables

Create a `.env` file (from `.env.template`):

```bash
# Transport Mode
TRANSPORT_MODE=stdio            # Options: "stdio" (default), "http"

# HTTP Server (only for HTTP mode)
HTTP_PORT=8000

# Debug logging
DEBUG=mcp:*

# Pulsar Configuration
PULSAR_SOCKET_URL=http://localhost:3000
PULSAR_API_KEY=dev-pulsar-interactive-key-2024

# File Manager Base Path
FILE_MANAGER_BASE_PATH=/Users/rckdrigo/Projects/pulsar-interactive
```

## Troubleshooting

### MCP Server Not Showing in Claude Code
1. Check if server is in the list: `claude mcp list`
2. Verify configuration: `claude mcp get satellite`
3. Try removing and re-adding:
   ```bash
   claude mcp remove satellite
   claude mcp add satellite -- npx -y tsx /path/to/server.ts
   ```

### Tools Not Available
1. Restart Claude Desktop/Code after configuration changes
2. Check server logs for errors (when using stdio, errors appear in Claude's logs)
3. Verify `.env` file has correct values

### HTTP Mode Connection Issues
1. Ensure server is running: `npm run start:http`
2. Check if port 8000 is available
3. Verify API key in Authorization header matches `MCP_API_KEY` in `.env`

## Development

### Running in Development Mode
```bash
# Stdio mode with MCP Inspector
npm run dev

# HTTP mode with MCP Inspector
npm run dev:http
```

The MCP Inspector will open at `http://localhost:5173` for testing tools interactively.

### Adding New Tools
1. Create tool in `src/tools/[name].ts`
2. Register in `src/server.ts`
3. Add tests in `tests/tools/[name].test.ts`
4. Run tests: `npm test`

## Next Steps

1. **Use in Claude Desktop**: Open Claude Desktop and try asking it to check Pulsar health or get the current time
2. **Use in Claude Code**: Run `claude` in your terminal and use the MCP tools naturally in conversation
3. **Extend**: Add new tools as needed for your Pulsar Interactive workflow

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [Satellite CLAUDE.md](./CLAUDE.md) - Detailed development guide
- [Pulsar Interactive CLAUDE.md](../CLAUDE.md) - Project overview
