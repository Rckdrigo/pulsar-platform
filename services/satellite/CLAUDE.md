# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **MCP (Model Context Protocol) Server** for the Pulsar Interactive ecosystem with a minimal, focused toolset.

**Current Tools**:
- `pulsar-health`: HTTP-based health check for Pulsar backend
- `get-current-date`: Date/time utility with timezone support
- **File Management Tools**: Comprehensive file system operations with security validation
  - `file-read`: Read file contents
  - `file-write`: Create or overwrite files (dry-run by default)
  - `file-delete`: Delete files and directories (dry-run by default)
  - `file-list`: List directory contents
  - `file-search`: Search files using glob patterns
  - `file-move`: Move or rename files (dry-run by default)
  - `file-copy`: Copy files (dry-run by default)
  - `file-stats`: Get file/directory information

**Communication**: Dual-mode transport support:
- **Stdio** (default): stdin/stdout for local Claude Desktop integration
- **HTTP Streaming** (new): Stateless HTTP POST for web-based clients on port 8000

**Architecture**: Simplified REST-only integration - no WebSocket dependencies

## Transport Modes

This MCP server supports two transport modes:

### Stdio Transport (Default)
- Local process-based communication
- Used for Claude Desktop integration
- No network overhead
- Default mode when running `npm run dev`

### HTTP Streaming Transport (New)
- Stateless HTTP-based communication
- Single POST endpoint at `POST /mcp`
- Health check available at `GET /health`
- Ideal for web-based clients and remote access
- Configurable port (default: 8000)

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

### Configuration Sync Agent

The Satellite MCP server includes an automated sync agent that keeps Claude Desktop and Claude Code configurations synchronized. This ensures both applications have the same environment variables, server paths, and transport settings.

**Usage**:
- `npm run config:sync` - Check sync status (dry-run, shows what would change)
- `npm run config:sync:apply` - Apply changes to both configurations
- Automatically creates timestamped backups before making changes
- Run after updating environment variables or server paths

### Development Server

The MCP Inspector provides a web-based interface to test your tools:

**Stdio mode (recommended for development)**:
```bash
npm run dev
```

**HTTP mode**:
```bash
npm run dev:http
```

Both launch the MCP Inspector at `http://localhost:5173` and allow you to:
- Call tools with parameters
- View responses in real-time
- Test without building a full client

## Project Architecture

### Core Structure

```
src/
├── server.ts              # Main MCP server setup with dual-mode transport support
├── httpServer.ts          # HTTP streaming transport with Koa
├── tools/                 # Tool implementations
│   ├── pulsar.js          # pulsar-health HTTP health check tool
│   ├── get-date.ts        # get-current-date utility tool
│   ├── file-manager.ts    # File management tools (read, write, delete, search, etc.)
│   └── ...                # Additional tools can be added here
├── resources/             # Static resources (empty - ready for new resources)
└── prompts/               # Prompt templates (empty - ready for new prompts)
tests/
└── tools/                 # Tool tests directory
    ├── pulsar.test.ts     # Tests for Pulsar health check tool
    ├── file-manager.test.ts # Tests for file management tools
    └── ...                # Test files for other tools
```

### server.ts

The main entry point that:
- Initializes the MCP server with name "Satellite MCP Server" v1.0.0
- Registers available tools (currently: `registerGetDateTool`, `registerPulsarTools`, `registerFileTools`)
- Detects transport mode from CLI arguments or `TRANSPORT_MODE` environment variable
- Connects via stdio (default) or HTTP transport
- Supports graceful shutdown

### httpServer.ts

HTTP streaming transport implementation:
- Uses Koa.js for lightweight HTTP server (consistent with Pulsar backend)
- Implements stateless StreamableHTTPServerTransport
- Single POST `/mcp` endpoint for MCP requests
- `GET /health` endpoint for server health checks
- Configurable port via `HTTP_PORT` environment variable (default: 8000)

### Current Tools

#### pulsar-health (`src/tools/pulsar.js`)
- **Type**: HTTP REST-based tool
- **Purpose**: Monitor Pulsar backend health via `/api/v1/health` endpoint
- **Parameters**:
  - `includeDetails` (boolean, optional) - Get detailed health information
- **Response**: Status, version, service info, and optional detailed checks
- **Environment**: `PULSAR_SOCKET_URL`, `PULSAR_API_KEY` (optional)

#### get-current-date (`src/tools/get-date.ts`)
- **Type**: System utility tool
- **Purpose**: Get current date/time with timezone support
- **Parameters**:
  - `timezone` (string, optional) - IANA timezone (e.g., 'America/New_York')
- **Response**: Multiple date formats (ISO, UNIX timestamp, full text)

#### File Management Tools (`src/tools/file-manager.ts`)
- **Type**: File system operations with security validation
- **Purpose**: Provide comprehensive file and directory management for adding docs, managing code, and organizing projects
- **Base Path**: Configurable via `FILE_MANAGER_BASE_PATH` environment variable (default: user home directory)
- **Security**: All paths validated to ensure they're within the allowed base path
- **Dry-Run Pattern**: Destructive operations default to preview mode for safety

**Available Tools**:

**file-read** - Read file contents
- Parameters:
  - `path` (string, required) - File path (relative to base path or absolute)
- Returns: File contents with size information
- Errors: File not found, permission denied, attempting to read directory

**file-write** - Create or overwrite files
- Parameters:
  - `path` (string, required) - File path
  - `content` (string, required) - Content to write
  - `dryRun` (boolean, optional, default: true) - Preview mode
- Behavior: Creates parent directories if needed
- Returns: Success message with file size
- Errors: Permission denied, invalid path

**file-delete** - Delete files or directories
- Parameters:
  - `path` (string, required) - Path to delete
  - `recursive` (boolean, optional, default: false) - Allow directory deletion
  - `dryRun` (boolean, optional, default: true) - Preview mode
- Returns: Confirmation message
- Errors: File not found, permission denied, directory without recursive flag

**file-list** - List directory contents
- Parameters:
  - `path` (string, optional, default: ".") - Directory path
  - `showHidden` (boolean, optional, default: false) - Include hidden files
- Returns: Formatted list with file types and sizes
- Errors: Not a directory, permission denied

**file-search** - Search files using glob patterns
- Parameters:
  - `pattern` (string, required) - Glob pattern (e.g., "**/*.ts", "src/**/test*.js")
  - `path` (string, optional, default: ".") - Base path to search from
- Returns: List of matching files with types and sizes
- Examples:
  - `**/*.md` - Find all markdown files
  - `src/**/*.ts` - Find TypeScript files in src
  - `**/test*.js` - Find test files

**file-move** - Move or rename files/directories
- Parameters:
  - `source` (string, required) - Source path
  - `destination` (string, required) - Destination path
  - `dryRun` (boolean, optional, default: true) - Preview mode
- Behavior: Creates destination parent directories if needed
- Returns: Success message with both paths
- Errors: Source not found, destination exists, permission denied

**file-copy** - Copy files
- Parameters:
  - `source` (string, required) - Source file path
  - `destination` (string, required) - Destination file path
  - `dryRun` (boolean, optional, default: true) - Preview mode
- Behavior: Creates destination parent directories if needed
- Limitations: Directory copying not yet supported
- Returns: Success message with size
- Errors: Source not found, destination exists, source is directory

**file-stats** - Get detailed file/directory information
- Parameters:
  - `path` (string, required) - Path to inspect
- Returns: Type, size, modified date, permissions (readable/writable)
- Errors: Path not found, permission denied

**Configuration**:
- Set `FILE_MANAGER_BASE_PATH` in `.env` to restrict file access scope
- Examples:
  - `~/Projects` - Allow access to all projects
  - `~/Projects/pulsar-interactive` - Restrict to Pulsar workspace only
  - Leave empty for full home directory access

### Removed Components

The following WebSocket-based tools and infrastructure were removed in favor of a minimal REST-only approach:
- `pulsar-send-message` - Send messages to Pulsar AI
- `pulsar-conversation-info` - Get conversation metadata
- `pulsar-clear-conversation` - Clear conversation history
- `pulsar-connection-status` - Check WebSocket connection
- `pulsar-join-room` - Join a chat room
- `pulsar-leave-room` - Leave a chat room
- `src/services/pulsarSocket.js` - WebSocket service (no longer needed)

## Building Tools

### Basic Tool Pattern

Create a new file in `src/tools/`:

```typescript
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyToolName(server: McpServer) {
  server.tool("my-tool",
    {
      // Zod schema for parameter validation
      parameter1: z.string().describe("Description of parameter"),
      parameter2: z.number().optional().describe("Optional numeric parameter")
    },
    // Handler function
    async ({ parameter1, parameter2 }) => {
      // Your implementation here
      const result = `Processed: ${parameter1}`;

      return {
        content: [
          { type: "text", text: result }
        ]
      };
    }
  );
}
```

### Registering in server.ts

1. Import the tool registration function
2. Call it in the server setup:

```typescript
import { registerMyToolName } from "./tools/my-tool.js";

// ... server initialization ...

registerMyToolName(server);
```

### Tool Best Practices

- **Zod Schemas**: Always validate inputs with Zod schemas
- **Async/Await**: Use async functions for long-running operations
- **Error Handling**: Wrap in try/catch and return descriptive error messages
- **MCP Content**: Return responses in MCP format: `{ content: [{ type: "text", text: "..." }] }`
- **Documentation**: Add descriptions to parameters via Zod's `.describe()` method

## Building Resources

Resources provide static or computed data to Claude Code:

```typescript
export function registerMyResource(server: McpServer) {
  server.resource(
    "resource-name",
    "mime/type",
    async () => ({
      contents: [
        {
          uri: "resource://my-resource",
          text: "Resource content here"
        }
      ]
    })
  );
}
```

## Building Prompts

Prompts provide reusable prompt templates with variables:

```typescript
export function registerMyPrompt(server: McpServer) {
  server.prompt(
    "prompt-name",
    { variableA: z.string() },
    async ({ variableA }) => ({
      messages: [
        {
          role: "user",
          content: `Template content with variable: ${variableA}`
        }
      ]
    })
  );
}
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.template`:

```bash
# Transport Mode
TRANSPORT_MODE=stdio            # Options: "stdio" (default), "http"

# HTTP Server Configuration (only used when TRANSPORT_MODE=http)
HTTP_PORT=8000                  # Port for HTTP streaming transport

# Debug logging configuration
DEBUG=                           # Set to "mcp:*" for detailed debug output

# Pulsar API Configuration
PULSAR_SOCKET_URL=http://localhost:3000   # Pulsar backend API endpoint
PULSAR_API_KEY=                            # Optional API key for authentication

# File Manager Configuration
FILE_MANAGER_BASE_PATH=                    # Base path for file operations (default: home directory)
```

**Environment Variable Details**:
- `TRANSPORT_MODE`: Choose transport mode (`stdio` for Claude Desktop, `http` for web clients)
- `HTTP_PORT`: Port for HTTP streaming server (default: 8000, only used in http mode)
- `PULSAR_SOCKET_URL`: Base URL for Pulsar REST API (used by `pulsar-health` tool)
- `PULSAR_API_KEY`: Optional authentication token (added to `X-API-Key` header)
- `FILE_MANAGER_BASE_PATH`: Base directory for file management tools (default: `$HOME`). All file operations are restricted to this path and its subdirectories for security. Examples: `~/Projects`, `~/Projects/pulsar-interactive`
- `DEBUG`: Enable MCP protocol debugging (set to `mcp:*` for full debugging)

### Available Dependencies

For building new tools:
- **axios**: HTTP client for API requests
- **koa**: Lightweight HTTP framework (for HTTP transport)
- **@koa/bodyparser**: Request body parsing middleware
- **zod**: Schema validation for tool parameters
- **dotenv**: Environment variable management
- **glob**: File pattern matching for searching files
- **fs/promises**: Node.js async file system operations
- **path**: Node.js path manipulation utilities

## Testing

### Running Tests

```bash
npm test                 # Run all tests
npm test:coverage        # Generate coverage report
npm test -- my.test      # Run specific test file
```

### Test Structure

Tests are located in `tests/` with matching structure to `src/`:

```typescript
describe("My Tool", () => {
  test("should work correctly", async () => {
    // Your test here
  });
});
```

## Type System

- **TypeScript**: Strict mode enabled
- **Target**: ES2022
- **Module**: ESM (ES Modules)

## Development Workflow

1. **Create Tool**: Add file to `src/tools/[name].ts`
2. **Implement**: Follow the tool pattern with Zod validation
3. **Register**: Import and call in `src/server.ts`
4. **Test**: Add tests in `tests/tools/[name].test.ts`
5. **Debug**: Run `npm run dev` to test with MCP Inspector

## Testing with HTTP Transport

Once running in HTTP mode, you can test the server with:

**Check health status**:
```bash
curl http://localhost:8000/health
```

**Call a tool via HTTP**:
```bash
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
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

**Using MCP Inspector with HTTP**:
The MCP Inspector automatically detects and works with HTTP transport when using `npm run dev:http`.

**Connecting from other clients**:
- Point your MCP client to `http://localhost:8000/mcp`
- Use POST method with MCP JSON-RPC protocol
- Include `Content-Type: application/json` header

## Debugging

Enable detailed debug output:

**Stdio mode**:
```bash
DEBUG=mcp:* npm run dev
```

**HTTP mode**:
```bash
DEBUG=mcp:* npm run dev:http
```

This shows:
- Tool calls with parameters
- MCP protocol messages
- Response handling

## Security Considerations

- **No Hardcoded Secrets**: Keep credentials in `.env` file
- **Input Validation**: Always validate tool inputs with Zod
- **Error Messages**: Return helpful but safe error messages
- **Dependencies**: Review and audit dependencies with `npm audit`

## Integration with Pulsar Interactive

This MCP server is part of the Pulsar Interactive ecosystem:
- Provides health monitoring for the Pulsar backend via REST API
- Uses HTTP-only communication (no WebSocket dependencies)
- Designed to be minimal and extensible for adding new tools
- Can be extended with additional Claude Code enhancement tools as needed

### Current Pulsar Integration

The `pulsar-health` tool monitors Pulsar backend availability and status:
- Checks the Pulsar API health endpoint: `GET /api/v1/health`
- Supports optional API key authentication
- Returns detailed health information including service version, environment, and component status

## Common Tool Types

Examples of tools you could build:

1. **API Integrations**: Tools that call external APIs (axios ready)
2. **File Operations**: Tools that work with files and directories
3. **Data Processing**: Tools that transform or analyze data
4. **System Utilities**: Tools that interact with the system
5. **Service Management**: Tools that control running services
6. **AI/LLM Helpers**: Tools that enhance Claude's capabilities

## Next Steps

1. Review README.md for quick start
2. Run `npm run dev` to start the development server
3. Create your first tool following the basic pattern
4. Register it in `src/server.ts`
5. Test using the MCP Inspector at http://localhost:5173
