import axios from 'axios';
import { registerPulsarTools } from '../../src/tools/pulsar';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Pulsar Tools', () => {
  let mockServer: any;
  let toolHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = {
      tool: jest.fn(),
    };
    registerPulsarTools(mockServer);

    // Extract the handler function from the mock
    const [, , handler] = mockServer.tool.mock.calls[0];
    toolHandler = handler;
  });

  describe('Tool Registration', () => {
    test('pulsar tools module should be importable', () => {
      expect(registerPulsarTools).toBeDefined();
      expect(typeof registerPulsarTools).toBe('function');
    });

    test('should register the Pulsar health check tool', () => {
      // Verify only the health check tool is registered
      expect(mockServer.tool).toHaveBeenCalledTimes(1);

      // Get the tool names from the calls
      const toolNames = mockServer.tool.mock.calls.map((call) => call[0]);
      expect(toolNames).toContain('pulsar-health');
    });

    test('should have valid tool schema for health check', () => {
      const [toolName, schema, handler] = mockServer.tool.mock.calls[0];

      // Verify tool structure
      expect(toolName).toBe('pulsar-health');
      expect(typeof schema).toBe('object');
      expect(schema.includeDetails).toBeDefined();
      expect(typeof handler).toBe('function');
    });
  });

  describe('Health Check - Basic (No Details)', () => {
    test('should return basic health status without details', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'healthy',
          version: '1.0.0',
          service: 'pulsar',
        },
      });

      const result = await toolHandler({ includeDetails: false });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Pulsar Health Status');
      expect(result.content[0].text).toContain('healthy');
      expect(result.content[0].text).toContain('✓');
    });

    test('should format basic health response correctly', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'healthy',
          version: '2.1.0',
          service: 'pulsar-backend',
        },
      });

      const result = await toolHandler({});

      expect(result.content[0].text).toContain('Status: healthy');
      expect(result.content[0].text).toContain('Version: 2.1.0');
      expect(result.content[0].text).toContain('Service: pulsar-backend');
    });

    test('should show unhealthy status with X emoji', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'unhealthy',
          version: '1.0.0',
          service: 'pulsar',
        },
      });

      const result = await toolHandler({ includeDetails: false });

      expect(result.content[0].text).toContain('✗');
      expect(result.content[0].text).toContain('unhealthy');
    });
  });

  describe('Health Check - Detailed', () => {
    test('should return detailed health information', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'healthy',
          service: 'pulsar',
          version: '1.0.0',
          environment: 'production',
          auth_method: 'jwt',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'healthy', connected: true, connections: 5 },
            redis: { status: 'healthy', connected: true },
          },
          frontend_config: true,
        },
      });

      const result = await toolHandler({ includeDetails: true });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Comprehensive Health Check');
      expect(result.content[0].text).toContain('database');
      expect(result.content[0].text).toContain('redis');
    });

    test('should show detailed check status', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'healthy',
          service: 'pulsar',
          version: '1.0.0',
          environment: 'staging',
          auth_method: 'api-key',
          timestamp: new Date().toISOString(),
          checks: {
            postgres: {
              status: 'healthy',
              connected: true,
              connections: 10,
            },
            cache: { status: 'unhealthy', error: 'Connection timeout' },
          },
          frontend_config: false,
        },
      });

      const result = await toolHandler({ includeDetails: true });

      expect(result.content[0].text).toContain('postgres');
      expect(result.content[0].text).toContain('cache');
      expect(result.content[0].text).toContain('Connection timeout');
    });

    test('should display frontend config availability', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'healthy',
          service: 'pulsar',
          version: '1.0.0',
          environment: 'development',
          auth_method: 'jwt',
          timestamp: new Date().toISOString(),
          checks: {},
          frontend_config: true,
        },
      });

      const result = await toolHandler({ includeDetails: true });

      expect(result.content[0].text).toContain('Frontend Config Available');
      expect(result.content[0].text).toContain('Yes');
    });
  });

  describe('API Configuration', () => {
    test('should call the correct Pulsar API endpoint', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      await toolHandler({ includeDetails: false });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/health',
        expect.any(Object)
      );
    });

    test('should use custom PULSAR_SOCKET_URL from environment', async () => {
      process.env.PULSAR_SOCKET_URL = 'http://custom-host:9000';
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      await toolHandler({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://custom-host:9000/api/v1/health',
        expect.any(Object)
      );

      delete process.env.PULSAR_SOCKET_URL;
    });

    test('should include API key in headers when provided', async () => {
      process.env.PULSAR_API_KEY = 'test-api-key-123';
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      await toolHandler({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key-123',
          }),
        })
      );

      delete process.env.PULSAR_API_KEY;
    });

    test('should not include API key header when not provided', async () => {
      delete process.env.PULSAR_API_KEY;
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      await toolHandler({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'X-API-Key': expect.anything(),
          }),
        })
      );
    });

    test('should set request timeout to 5 seconds', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      await toolHandler({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle connection refused error', async () => {
      const error = new Error('connect ECONNREFUSED');
      (error as any).code = 'ECONNREFUSED';
      mockedAxios.get.mockRejectedValue(error);

      const result = await toolHandler({});

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('✗');
      expect(result.content[0].text).toContain(
        'Connection refused - Pulsar may not be running'
      );
      expect(result.isError).toBe(true);
    });

    test('should handle host not found error', async () => {
      const error = new Error('getaddrinfo ENOTFOUND');
      (error as any).code = 'ENOTFOUND';
      mockedAxios.get.mockRejectedValue(error);

      const result = await toolHandler({});

      expect(result.content[0].text).toContain('Host not found');
      expect(result.content[0].text).toContain('PULSAR_SOCKET_URL');
      expect(result.isError).toBe(true);
    });

    test('should handle 503 Service Unavailable error', async () => {
      const error = new Error('Service Unavailable');
      (error as any).response = { status: 503 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await toolHandler({});

      expect(result.content[0].text).toContain(
        'Service Unavailable - Pulsar is unhealthy'
      );
      expect(result.isError).toBe(true);
    });

    test('should handle 401 Unauthorized error', async () => {
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await toolHandler({});

      expect(result.content[0].text).toContain(
        'Unauthorized - Invalid API key'
      );
      expect(result.isError).toBe(true);
    });

    test('should handle generic errors with error message', async () => {
      const error = new Error('Unknown error occurred');
      mockedAxios.get.mockRejectedValue(error);

      const result = await toolHandler({});

      expect(result.content[0].text).toContain('Unknown error occurred');
      expect(result.isError).toBe(true);
    });

    test('should format error response in MCP compliant format', async () => {
      mockedAxios.get.mockRejectedValue(
        new Error('Connection failed')
      );

      const result = await toolHandler({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
    });
  });

  describe('Response Format', () => {
    test('should return MCP compliant format', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      const result = await toolHandler({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    test('should include isError flag on error responses', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Test error'));

      const result = await toolHandler({});

      expect(result).toHaveProperty('isError', true);
    });

    test('should not include isError flag on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0', service: 'pulsar' },
      });

      const result = await toolHandler({});

      expect(result.isError).toBeUndefined();
    });
  });
});
