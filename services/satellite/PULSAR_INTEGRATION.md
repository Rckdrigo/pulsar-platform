# Pulsar Integration for Satellite MCP Server

This document describes the Pulsar WebSocket integration implemented in the Satellite MCP server.

## Overview

The Satellite MCP server now includes tools for real-time communication with the Pulsar backend via WebSocket (Socket.IO). This integration enables MCP clients to interact with Pulsar's chat system, manage conversations, and monitor connection status.

## Components

### 1. WebSocket Service (`src/services/pulsarSocket.js`)

A singleton service that manages the Socket.IO connection to Pulsar.

**Key Features:**
- Auto-reconnection with exponential backoff
- Promise-based request/response pattern
- Connection health monitoring
- Proper cleanup and disconnection handling

**Methods:**
- `connect()` - Initialize and connect to Pulsar
- `ensureConnected()` - Ensure connection is established
- `sendMessage(text, roomId)` - Send a message and wait for AI response
- `getConversationInfo(roomId)` - Get conversation metadata
- `clearConversation(roomId)` - Clear conversation history
- `getConnectionStatus()` - Get current connection status
- `joinRoom(roomId)` - Join a chat room
- `leaveRoom(roomId)` - Leave a chat room
- `disconnect()` - Disconnect from server

### 2. MCP Tools (`src/tools/pulsar.js`)

Seven MCP tools that expose Pulsar functionality:

#### `pulsar-health`
Check Pulsar server health status and detailed system information.

**Parameters:**
- `includeDetails` (boolean, optional): Include detailed health check information (default: false)

**Returns:**
- Quick overview: Status, version, service info
- Detailed (with includeDetails=true): Disk, cache, websocket, and other health checks

**Example output (quick):**
```
✓ Status: healthy
📦 Version: 1.0.0
🔧 Service: pulsar
```

**Example output (detailed):**
```
Overall Status: ✓ Healthy
Service: pulsar
Version: 1.0.0
Environment: development
Auth Method: api_key
Timestamp: 2025-11-02T10:00:00.000Z

Detailed Checks:
- disk: ✓ healthy
- cache: ✓ healthy - Connected: true
- websocket: ✓ healthy - Connections: 5
```

#### `pulsar-send-message`
Send a message to Pulsar and get AI response.

**Parameters:**
- `message` (string, required): The message to send (1-5000 chars)
- `roomId` (string, optional): Room ID (defaults to "general")

**Returns:** AI response text

#### `pulsar-conversation-info`
Get information about a conversation.

**Parameters:**
- `roomId` (string, optional): Room ID (defaults to "general")

**Returns:** Conversation metadata (message count, participants, timestamps, etc.)

#### `pulsar-clear-conversation`
Clear conversation history in a room.

**Parameters:**
- `roomId` (string, optional): Room ID (defaults to "general")

**Returns:** Confirmation of cleared history

#### `pulsar-connection-status`
Check WebSocket connection status.

**Parameters:** None

**Returns:** Connection details (connected status, socket ID, URL, application ID)

#### `pulsar-join-room`
Join a chat room.

**Parameters:**
- `roomId` (string, required): Room ID to join

**Returns:** Confirmation message

#### `pulsar-leave-room`
Leave a chat room.

**Parameters:**
- `roomId` (string, required): Room ID to leave

**Returns:** Confirmation message

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# Pulsar WebSocket URL
PULSAR_SOCKET_URL=http://localhost:3000

# API key for authentication
PULSAR_API_KEY=your-api-key-here

# Application identifier
PULSAR_APPLICATION_ID=satellite-mcp

# Username for WebSocket connections
PULSAR_USERNAME=MCP-Server
```

### Default Values

- `PULSAR_SOCKET_URL`: `http://localhost:3000`
- `PULSAR_APPLICATION_ID`: `satellite-mcp`
- `PULSAR_USERNAME`: `MCP-Server`
- Default room ID: `general`

## Usage

### 1. Ensure Pulsar is Running

```bash
# In the pulsar-interactive directory
docker-compose up pulsar-backend
# OR
cd pulsar/
npm run dev
```

### 2. Set Up Environment

```bash
cp .env.template .env
# Edit .env and set PULSAR_API_KEY
```

### 3. Start MCP Server

```bash
npm run dev
```

This launches the MCP Inspector at `http://localhost:5173` where you can test the tools.

## Error Handling

All tools include comprehensive error handling:
- Connection timeouts (30s for messages, 10s for other operations)
- Network disconnection recovery
- Validation error messages
- Detailed error responses

## Authentication Flow

1. MCP server reads `PULSAR_API_KEY` from environment
2. Socket.IO client connects with auth object containing:
   - `apiKey`: From environment variable
   - `applicationId`: Identifies the MCP server
   - `username`: For chat messages
3. Pulsar validates the API key
4. Connection established with authenticated session

## WebSocket Events

The service handles these Socket.IO events:

**Connection Events:**
- `connect` - Successfully connected
- `connect_error` - Connection failed
- `disconnect` - Disconnected
- `reconnect` - Reconnected after disconnect

**Chat Events:**
- `send_message` (client → server) - Send message
- `new_message` (server → client) - User message received
- `message_response` (server → client) - AI response
- `streaming_error` (server → client) - Error during response

**Room Events:**
- `join_room` (client → server) - Join room
- `user_joined` (server → client) - User joined
- `leave_room` (client → server) - Leave room
- `user_left` (server → client) - User left

**Conversation Events:**
- `get_conversation_info` (client → server) - Get conversation data
- `conversation_info` (server → client) - Conversation metadata
- `clear_conversation` (client → server) - Clear history
- `conversation_cleared` (server → client) - Cleared confirmation

## Example: Sending a Message

```typescript
// Using the MCP tool
const result = await mcpClient.callTool('pulsar-send-message', {
  message: "Hello Pulsar!",
  roomId: "general"
});

// Returns:
// {
//   "content": [{
//     "type": "text",
//     "text": "Message sent to room \"general\"\n\n**AI Response:**\nHello! How can I help you?"
//   }]
// }
```

## Example: Checking Connection Status

```typescript
const result = await mcpClient.callTool('pulsar-connection-status');

// Returns:
// {
//   "content": [{
//     "type": "text",
//     "text": "**Pulsar WebSocket Connection Status**\n\n- Connected: ✓ Yes\n- Socket ID: abc123\n- Server URL: http://localhost:3000\n- Application ID: satellite-mcp"
//   }]
// }
```

## Testing

Run tests with:

```bash
npm test
```

Test file: `tests/tools/pulsar.test.js`

Tests verify:
- Tools module can be imported
- All 6 tools are registered
- Tool schemas are valid (name, schema object, handler function)

## Troubleshooting

### Connection Fails

1. Verify Pulsar is running on the configured URL
2. Check `PULSAR_API_KEY` is set and valid
3. Check firewall allows WebSocket connections
4. Verify Socket.IO port is not blocked

### Messages Not Received

1. Check room ID is correct
2. Verify API key authentication
3. Check Pulsar server logs for errors
4. Ensure Socket.IO connection is established

### Timeout Errors

- Messages: 30 second timeout
- Other operations: 10 second timeout
- If timeouts occur, Pulsar may be overloaded or disconnected

## Dependencies

- `socket.io-client` (^4.8.1) - WebSocket client
- `zod` (^3.21.4) - Schema validation
- `dotenv` (^16.0.0) - Environment variable loading

## Integration with Other Services

This integration connects the MCP server to Pulsar, enabling:

1. **AI Prompts** - Pulsar handles Claude AI requests
2. **Real-time Chat** - WebSocket-based conversations
3. **Multi-room Support** - Organize conversations by room
4. **Conversation Management** - Clear history, get metadata

The MCP server acts as a bridge allowing Claude Code to interact with Pulsar's chat and AI capabilities.

## Future Enhancements

Potential improvements:

1. **Stream Responses** - Handle streaming AI responses incrementally
2. **Room Management** - Create/delete rooms, list available rooms
3. **User Management** - Get active users, user profiles
4. **Message History** - Retrieve past messages from a room
5. **Event Subscriptions** - Subscribe to real-time events
6. **Flowise Integration** - Support Flowise AI workflow integration
7. **Cache Management Tools** - View cache stats, clear cache by type (HTTP endpoints)

## Security Considerations

1. **API Key**: Store in `.env`, never commit to git
2. **Validation**: All inputs validated with Zod schemas
3. **Error Messages**: Safe, non-revealing error responses
4. **Timeouts**: Prevent hanging connections
5. **Cleanup**: Proper disconnection and resource cleanup

## Support

For issues or questions:

1. Check Pulsar logs: `docker logs pulsar-backend` or `npm run dev` output
2. Check MCP Inspector for tool responses
3. Verify environment configuration
4. Check Socket.IO connection in browser devtools (if applicable)
