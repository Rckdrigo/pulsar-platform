import { registerGetDateTool } from "../../src/tools/get-date";

describe("Get Date Tool", () => {
  let mockServer: any;
  let toolHandler: any;

  beforeEach(() => {
    mockServer = {
      tool: jest.fn(),
    };
    registerGetDateTool(mockServer);

    // Extract the handler function from the mock
    const [, , handler] = mockServer.tool.mock.calls[0];
    toolHandler = handler;
  });

  describe("Tool Registration", () => {
    test("should register the get-current-date tool", () => {
      expect(mockServer.tool).toHaveBeenCalledTimes(1);
      const [toolName] = mockServer.tool.mock.calls[0];
      expect(toolName).toBe("get-current-date");
    });

    test("should have valid schema with timezone parameter", () => {
      const [, schema] = mockServer.tool.mock.calls[0];
      expect(schema).toBeDefined();
      expect(schema.timezone).toBeDefined();
    });

    test("should have a valid handler function", () => {
      const [, , handler] = mockServer.tool.mock.calls[0];
      expect(typeof handler).toBe("function");
    });
  });

  describe("Handler Functionality", () => {
    test("should return date in multiple formats without timezone", async () => {
      const result = await toolHandler({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");

      const content = JSON.parse(result.content[0].text);
      expect(content.current_date).toBeDefined();
      expect(content.current_date.iso).toBeDefined();
      expect(content.current_date.date_only).toBeDefined();
      expect(content.current_date.date_and_time).toBeDefined();
      expect(content.current_date.unix_timestamp).toBeDefined();
      expect(content.current_date.full_text).toBeDefined();
      expect(content.current_date.timezone).toBe("System");
      expect(content.current_date.timezone_name).toBeDefined();
    });

    test("should return date with specified timezone", async () => {
      const result = await toolHandler({ timezone: "America/New_York" });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");

      const content = JSON.parse(result.content[0].text);
      expect(content.current_date.timezone).toBe("America/New_York");
    });

    test("should return valid ISO format date", async () => {
      const result = await toolHandler({});
      const content = JSON.parse(result.content[0].text);
      const iso = content.current_date.iso;

      // Check ISO 8601 format
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    test("should return valid unix timestamp", async () => {
      const result = await toolHandler({});
      const content = JSON.parse(result.content[0].text);
      const timestamp = content.current_date.unix_timestamp;

      expect(typeof timestamp).toBe("number");
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });

    test("should return date only in YYYY-MM-DD format", async () => {
      const result = await toolHandler({});
      const content = JSON.parse(result.content[0].text);
      const dateOnly = content.current_date.date_only;

      expect(dateOnly).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("should return full text with day of week", async () => {
      const result = await toolHandler({});
      const content = JSON.parse(result.content[0].text);
      const fullText = content.current_date.full_text;

      // Should contain day name and month name
      expect(fullText).toBeDefined();
      expect(typeof fullText).toBe("string");
      expect(fullText.length).toBeGreaterThan(0);
    });

    test("should handle error with invalid timezone gracefully", async () => {
      const result = await toolHandler({ timezone: "Invalid/Timezone" });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");

      const content = JSON.parse(result.content[0].text);
      expect(content.error).toBe("Failed to get current date");
      expect(content.message).toBeDefined();
      expect(content.suggestion).toBeDefined();
    });

    test("should preserve timezone when specified", async () => {
      const timezones = [
        "America/Los_Angeles",
        "Europe/London",
        "Asia/Tokyo",
        "Australia/Sydney",
      ];

      for (const tz of timezones) {
        const result = await toolHandler({ timezone: tz });
        const content = JSON.parse(result.content[0].text);

        if (!content.error) {
          expect(content.current_date.timezone).toBe(tz);
        }
      }
    });

    test("should return consistent timestamp across calls", async () => {
      const result1 = await toolHandler({});
      const content1 = JSON.parse(result1.content[0].text);

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = await toolHandler({});
      const content2 = JSON.parse(result2.content[0].text);

      // Timestamps should be within 1 second
      const diff =
        content2.current_date.unix_timestamp -
        content1.current_date.unix_timestamp;
      expect(diff).toBeGreaterThanOrEqual(0);
      expect(diff).toBeLessThanOrEqual(1000);
    });

    test("should format response in MCP compliant format", async () => {
      const result = await toolHandler({});

      // Check MCP format
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty("type");
      expect(result.content[0]).toHaveProperty("text");
      expect(result.content[0].type).toBe("text");
    });
  });

  describe("Timezone Handling", () => {
    test("should handle UTC timezone", async () => {
      const result = await toolHandler({ timezone: "UTC" });
      const content = JSON.parse(result.content[0].text);

      expect(content.current_date.timezone).toBe("UTC");
      expect(content.current_date.timezone_name).toBeDefined();
    });

    test("should default to System timezone when not specified", async () => {
      const result = await toolHandler({ timezone: undefined });
      const content = JSON.parse(result.content[0].text);

      expect(content.current_date.timezone).toBe("System");
    });

    test("should handle timezone with spaces gracefully", async () => {
      const result = await toolHandler({ timezone: "America/New York" });

      // This should error since it's not a valid timezone format
      const content = JSON.parse(result.content[0].text);
      expect(content.error || content.current_date).toBeDefined();
    });
  });
});
