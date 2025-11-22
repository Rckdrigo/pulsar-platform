import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import { registerGetDateTool } from "./tools/get-date.js";
import { registerPulsarTools } from "./tools/pulsar.js";
import { registerMeetingTranscriptTools } from "./tools/meeting-transcripts.js";

// Import HTTP server
import { startHttpServer } from "./httpServer.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

/**
 * Create and configure the MCP server with tools
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "Satellite MCP Server",
    version: "1.0.0"
  });

  // Register tools
  registerGetDateTool(server);
  registerPulsarTools(server);
  registerMeetingTranscriptTools(server);

  // TODO: Register more tools here
  // TODO: Register resources here
  // TODO: Register prompts here

  return server;
}

/**
 * Determine transport mode from environment or CLI arguments
 */
function getTransportMode(): "stdio" | "http" {
  // Check CLI arguments first (e.g., npm run dev:http passes "http")
  const cliMode = process.argv[2];
  if (cliMode === "http" || cliMode === "stdio") {
    return cliMode as "stdio" | "http";
  }

  // Check environment variable
  const envMode = process.env.TRANSPORT_MODE;
  if (envMode === "http" || envMode === "stdio") {
    return envMode as "stdio" | "http";
  }

  // Default to stdio
  return "stdio";
}

/**
 * Start the MCP server with the appropriate transport
 */
async function startServer(): Promise<void> {
  const transportMode = getTransportMode();
  const server = createMcpServer();

  // Use console.error for logging in stdio mode (logs to stderr, not stdout)
  console.error("[Server] Starting Satellite MCP Server...");
  console.error(`[Server] Transport mode: ${transportMode}`);

  if (transportMode === "http") {
    const port = parseInt(process.env.HTTP_PORT || "8000", 10);
    console.error(`[Server] Connecting MCP HTTP streaming transport (port ${port})...`);
    await startHttpServer(server, port);
    console.error("[Server] Satellite MCP Server fully operational (HTTP mode)");
  } else {
    console.error("[Server] Connecting MCP stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[Server] Satellite MCP Server fully operational (stdio mode)");
  }
}

// Start the server
startServer().catch((error) => {
  console.error("[Server] Fatal error:", error);
  process.exit(1);
});