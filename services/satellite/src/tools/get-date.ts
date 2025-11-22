import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Get current date in specified timezone
 */
async function getCurrentDateHandler({ timezone }: { timezone?: string }) {
  try {
    const now = new Date();

    // Get timezone offset info
    const timeZoneOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone || undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat("en-US", timeZoneOptions);
    const parts = formatter.formatToParts(now);

    // Extract parts
    const partMap: Record<string, string> = {};
    parts.forEach((part) => {
      if (part.type !== "literal") {
        partMap[part.type] = part.value;
      }
    });

    const year = partMap.year;
    const month = partMap.month;
    const day = partMap.day;
    const hour = partMap.hour;
    const minute = partMap.minute;
    const second = partMap.second;

    // Format results
    const isoFormat = now.toISOString();
    const dateOnly = `${year}-${month}-${day}`;
    const timeWithTimezone = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const unixTimestamp = now.getTime();

    // Get full text representation
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const fullText = dateFormatter.format(now);

    // Get timezone name
    const timeZoneNameFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      timeZoneName: "short"
    });
    const tzParts = timeZoneNameFormatter.formatToParts(now);
    const timeZoneName = tzParts.find((p) => p.type === "timeZoneName")
      ?.value || "System";

    const result = {
      current_date: {
        iso: isoFormat,
        date_only: dateOnly,
        date_and_time: timeWithTimezone,
        unix_timestamp: unixTimestamp,
        full_text: fullText,
        timezone: timezone || "System",
        timezone_name: timeZoneName
      }
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Failed to get current date",
              message: errorMessage,
              suggestion:
                "Ensure the timezone parameter is a valid IANA timezone string (e.g., 'America/New_York')"
            },
            null,
            2
          )
        }
      ]
    };
  }
}

/**
 * Register the get-current-date tool with the MCP server
 */
export function registerGetDateTool(server: McpServer) {
  const schema = {
    timezone: z
      .string()
      .optional()
      .describe(
        "IANA timezone string (e.g., 'America/New_York', 'Europe/London'). Defaults to system timezone."
      )
  };

  // Register in MCP server
  server.tool("get-current-date", schema, getCurrentDateHandler as any);
}
