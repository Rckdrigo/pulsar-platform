import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

/**
 * Parse JSON request body
 */
async function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/**
 * Authenticate request using API key from header
 * Supports: X-API-Key header or Authorization: Bearer <key>
 */
function authenticateRequest(
  req: http.IncomingMessage,
  mcpApiKey: string | undefined
): { authenticated: boolean; error?: string } {
  // If no API key is configured, allow all requests (development mode)
  if (!mcpApiKey) {
    return { authenticated: true };
  }

  // Try X-API-Key header first
  const apiKeyHeader = req.headers["x-api-key"];
  if (apiKeyHeader && apiKeyHeader === mcpApiKey) {
    return { authenticated: true };
  }

  // Try Authorization: Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");
    if (scheme === "Bearer" && token === mcpApiKey) {
      return { authenticated: true };
    }
  }

  // Authentication failed
  return {
    authenticated: false,
    error: "Unauthorized: Invalid or missing API key",
  };
}

/**
 * Start the MCP server with HTTP streaming transport using Node.js HTTP server
 * Implements stateless HTTP transport - new transport per request
 */
export async function startHttpServer(
  server: McpServer,
  port: number = 8000
): Promise<http.Server> {
  const mcpApiKey = process.env.MCP_API_KEY;

  if (mcpApiKey) {
    console.error("[httpServer] MCP API key authentication enabled");
  } else {
    console.error(
      "[httpServer] WARNING: MCP API key not configured. API is open to all requests."
    );
  }

  return new Promise((resolve) => {
    const httpServer = http.createServer(
      async (req: http.IncomingMessage, res: http.ServerResponse) => {
        // Health check endpoint (no authentication required)
        if (req.url === "/health" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "ok",
              message: "Satellite MCP Server HTTP transport is running",
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        // MCP endpoint: POST /mcp (requires authentication)
        if (req.url === "/mcp" && req.method === "POST") {
          try {
            // Authenticate request
            const auth = authenticateRequest(req, mcpApiKey);
            if (!auth.authenticated) {
              console.error(
                "[httpServer] Unauthorized MCP request: " + auth.error
              );
              res.writeHead(401, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  error: "Unauthorized",
                  message: auth.error,
                })
              );
              return;
            }

            // Create a new stateless transport for this request
            const transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: undefined, // Stateless mode
              enableJsonResponse: true, // Return JSON instead of SSE
            });

            // Parse request body
            const body = await parseJsonBody(req);

            // Handle request and send response
            await transport.handleRequest(req, res, body);
          } catch (error) {
            console.error("[httpServer] MCP request error:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Internal server error",
                message:
                  error instanceof Error ? error.message : "Unknown error occurred",
              })
            );
          }
          return;
        }

        // Root endpoint
        if (req.url === "/" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "ok",
              message: "Satellite MCP Server (HTTP transport)",
              endpoints: {
                health: "GET /health",
                mcp: "POST /mcp",
              },
            })
          );
          return;
        }

        // 404 handler
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Not found",
            message: `${req.method} ${req.url} not supported. Use POST /mcp`,
          })
        );
      }
    );

    httpServer.listen(port, () => {
      console.error(
        `[httpServer] Satellite MCP Server listening on http://localhost:${port}`
      );
      console.error(
        `[httpServer] POST /mcp - MCP tool calls (HTTP streaming transport)`
      );
      console.error(`[httpServer] GET /health - Health check endpoint`);
      resolve(httpServer);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.error("[httpServer] SIGTERM received, gracefully shutting down...");
      httpServer.close(() => {
        console.error("[httpServer] Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.error("[httpServer] SIGINT received, gracefully shutting down...");
      httpServer.close(() => {
        console.error("[httpServer] Server closed");
        process.exit(0);
      });
    });
  });
}
