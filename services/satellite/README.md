# Satellite MCP Server

A Model Context Protocol (MCP) server for the Pulsar Interactive ecosystem with a minimal, focused toolset.

## Features

- **Dual Transport Modes**: Stdio (default) for Claude Desktop/Code, HTTP streaming for web clients
- **Pulsar Integration**: Health monitoring for Pulsar backend
- **File Management**: Comprehensive file operations with security validation
- **Date/Time Utilities**: Timezone-aware date/time tools
- **Configuration Sync**: Automated sync agent for Claude Desktop and Claude Code

## Quick Start

```bash
# Install dependencies
npm install

# Start development server with MCP Inspector
npm run dev

# Check configuration sync status
npm run config:sync

# Sync Claude Desktop and Claude Code configurations
npm run config:sync:apply
```

## Available Tools

### Pulsar Integration

- **pulsar-health** - HTTP-based health check for Pulsar backend API

### Date/Time Utilities

- **get-current-date** - Get current date/time with timezone support

### File Management (with security validation)

- **file-read** - Read file contents
- **file-write** - Create or overwrite files (dry-run by default)
- **file-delete** - Delete files and directories (dry-run by default)
- **file-list** - List directory contents
- **file-search** - Search files using glob patterns
- **file-move** - Move or rename files (dry-run by default)
- **file-copy** - Copy files (dry-run by default)
- **file-stats** - Get file/directory information

## Configuration Sync Agent

The Satellite MCP server includes an automated sync agent to keep Claude Desktop and Claude Code configurations synchronized.

**Usage**:

```bash
# Check if configurations are in sync (dry-run)
npm run config:sync

# Apply configuration sync
npm run config:sync:apply
```

**Features**:

- Compares both configurations against the canonical configuration
- Creates timestamped backups before making changes
- Updates both Claude Desktop and Claude Code configs
- Reports what changed and next steps

**When to use**:

- After updating the satellite server path
- When environment variables change
- After making manual changes to either configuration
- When troubleshooting MCP connection issues

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start MCP server with stdio transport + MCP Inspector (recommended)
npm run dev:http         # Start MCP server with HTTP streaming + MCP Inspector
npm start                # Start production server (stdio transport)
npm start:http           # Start production HTTP server (port 8000)
npm test                 # Run all tests with Jest
npm test:coverage        # Run tests with coverage report
npm run config:sync      # Check if Claude Desktop and Claude Code configs are in sync (dry-run)
npm run config:sync:apply # Sync Claude Desktop and Claude Code configurations
npm run config:check     # Alias for config:sync (dry-run)
```

## Transport Modes

### Stdio Transport (Default)

- Local process-based communication
- Used for Claude Desktop and Claude Code integration
- No network overhead
- Default mode when running `npm run dev`

### HTTP Streaming Transport

- Stateless HTTP-based communication
- Single POST endpoint at `POST /mcp`
- Health check available at `GET /health`
- Ideal for web-based clients and remote access
- Configurable port (default: 8000)

### Docker Deployment (HTTP Mode)

Run the Satellite MCP server in Docker using HTTP transport:

```bash
# From pulsar-interactive root directory
docker-compose up -d satellite-mcp

# Test the Docker HTTP server
cd satellite && ./test-docker-http.sh

# View logs
docker logs -f satellite-mcp
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete Docker deployment guide.

## Configuration

Create a `.env` file based on `.env.template`:

```bash
# Transport Mode
TRANSPORT_MODE=stdio            # Options: "stdio" (default), "http"

# HTTP Server Configuration (only used when TRANSPORT_MODE=http)
HTTP_PORT=8000                  # Port for HTTP streaming transport

# Debug logging configuration
DEBUG=                          # Set to "mcp:*" for detailed debug output

# Pulsar API Configuration
PULSAR_SOCKET_URL=http://localhost:3000   # Pulsar backend API endpoint
PULSAR_API_KEY=                           # Optional API key for authentication

# File Manager Configuration
FILE_MANAGER_BASE_PATH=                   # Base path for file operations (default: home directory)
```

## Claude Desktop Integration

The Satellite MCP server is configured in Claude Desktop at:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Configuration:

```json
{
  "mcpServers": {
    "satellite": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/satellite/src/server.ts"],
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

Use the sync agent to keep this configuration up to date:

```bash
npm run config:sync:apply
```

## Claude Code Integration

Project-level configuration in `.mcp.json`:

```json
{
  "mcpServers": {
    "satellite": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/satellite/src/server.ts"],
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

Verify configuration:

```bash
claude mcp list
claude mcp get satellite
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm test:coverage

# Run specific test file
npm test -- file-manager.test
```

## Adding New Tools

1. Create a new file in `src/tools/[name].ts`
2. Implement the tool following the MCP SDK pattern
3. Register the tool in `src/server.ts`
4. Add tests in `tests/tools/[name].test.ts`
5. Run tests: `npm test`

Example tool structure:

```typescript
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyTool(server: McpServer) {
  server.tool("my-tool",
    {
      parameter1: z.string().describe("Description of parameter")
    },
    async ({ parameter1 }) => {
      // Your implementation here
      return {
        content: [
          { type: "text", text: `Result: ${parameter1}` }
        ]
      };
    }
  );
}
```

## Documentation

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker deployment guide (HTTP mode)
- [MCP-SETUP.md](./MCP-SETUP.md) - Setup guide for Claude Desktop and Claude Code
- [CLAUDE.md](./CLAUDE.md) - Detailed development guide
- [LOCAL_DEV.md](./LOCAL_DEV.md) - Local development workflow
- [Pulsar Interactive CLAUDE.md](../CLAUDE.md) - Project overview

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [Pulsar Interactive](https://github.com/rckdrigo/pulsar-interactive)

## License

Part of the Pulsar Interactive ecosystem.
