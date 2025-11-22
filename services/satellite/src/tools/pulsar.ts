import { z } from 'zod';
import axios from 'axios';

/**
 * Register Pulsar tools with the MCP server
 */
export function registerPulsarTools(server) {
  registerPulsarHealthCheck(server);
}

/**
 * Check Pulsar server health status
 */
async function pulsarHealthHandler({ includeDetails = false }) {
  try {
    const pulsarUrl = process.env.PULSAR_SOCKET_URL || 'http://localhost:3000';
    const apiKey = process.env.PULSAR_API_KEY;

    const response = await axios.get(`${pulsarUrl}/api/v1/health`, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
      timeout: 5000,
    });

    const data = response.data as any;

    if (!includeDetails) {
      const statusEmoji = data.status === 'healthy' ? '✓' : '✗';
      const statusText = `**Pulsar Health Status**\n\n${statusEmoji} Status: ${data.status}\n📦 Version: ${data.version || 'unknown'}\n🔧 Service: ${data.service || 'pulsar'}`;

      return {
        content: [
          {
            type: 'text',
            text: statusText,
          },
        ],
      };
    }

    // Detailed health info
    const checksInfo =
      data.checks && Object.keys(data.checks).length > 0
        ? '\n\n**Detailed Checks:**\n' +
          Object.entries(data.checks)
            .map(
              ([name, check]: [string, any]) =>
                `- ${name}: ${check.status === 'healthy' ? '✓' : '✗'} ${check.status}${check.error ? ` (${check.error})` : ''}${
                  typeof check.connected === 'boolean' ? ` - Connected: ${check.connected}` : ''
                }${check.connections ? ` - Connections: ${check.connections}` : ''}`
            )
            .join('\n')
        : '';

    const detailedText = `
**Pulsar Comprehensive Health Check**

**Overall Status**: ${data.status === 'healthy' ? '✓ Healthy' : '✗ Unhealthy'}
**Service**: ${data.service || 'pulsar'}
**Version**: ${data.version || 'unknown'}
**Environment**: ${data.environment || 'unknown'}
**Auth Method**: ${data.auth_method || 'unknown'}
**Timestamp**: ${data.timestamp || new Date().toISOString()}
${checksInfo}

**Frontend Config Available**: ${data.frontend_config ? 'Yes' : 'No'}
    `.trim();

    return {
      content: [
        {
          type: 'text',
          text: detailedText,
        },
      ],
    };
  } catch (error) {
    const statusEmoji = '✗';
    let errorMessage = error.message;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - Pulsar may not be running';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Host not found - Check PULSAR_SOCKET_URL';
    } else if (error.response?.status === 503) {
      errorMessage = 'Service Unavailable - Pulsar is unhealthy';
    } else if (error.response?.status === 401) {
      errorMessage = 'Unauthorized - Invalid API key';
    }

    return {
      content: [
        {
          type: 'text',
          text: `${statusEmoji} **Pulsar Health Check Failed**\n\nError: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Register the Pulsar health check tool with the MCP server
 */
function registerPulsarHealthCheck(server) {
  const schema = {
    includeDetails: z
      .boolean()
      .optional()
      .describe('Include detailed health check information (default: false)'),
  };

  // Register in MCP server
  server.tool('pulsar-health', schema, pulsarHealthHandler as any);
}
