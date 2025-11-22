import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

// Hardcoded directories to search for meeting transcripts
// Update these paths to match where you store your meeting transcripts
const TRANSCRIPT_DIRS = [
  "/Users/rckdrigo/Documents", // Documents folder
  "/Users/rckdrigo/Projects/pulsar-interactive/clients", // Project root
  "/Users/rckdrigo/Documents/Zoom", // Downloads folder
];

// Supported file extensions for meeting transcripts
const SUPPORTED_EXTENSIONS = [".md", ".txt", ".vt"];

interface TranscriptMatch {
  filepath: string;
  filename: string;
  size: number;
  modifiedDate: string;
  sourceDirectory: string;
}

/**
 * Build a flexible glob pattern from a topic string
 * Example: "team meeting" → `**\/*team*meeting*`
 */
function buildGlobPattern(topic: string, extensions: string[]): string {
  // Normalize topic: trim, lowercase, split into words
  const words = topic.trim().toLowerCase().split(/\s+/);

  // Build pattern with wildcards between words
  const wordsPattern = words.map((word) => `*${word}*`).join("");

  // Create extension pattern (e.g., "*.{md,txt,vt}")
  const extPattern = extensions.length > 1
    ? `{${extensions.map(ext => ext.slice(1)).join(",")}}`
    : extensions[0].slice(1);

  // Combine pattern like: **\/word1*word2*.{ext1,ext2}
  return `**/${wordsPattern}.${extPattern}`;
}

/**
 * Parse ISO date string to Date object
 */
function parseISODate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}. Use ISO format (YYYY-MM-DD)`);
  }
  return date;
}

/**
 * Check if a file's modification date falls within the specified range
 */
function isWithinDateRange(
  fileDate: Date,
  startDate?: string,
  endDate?: string
): boolean {
  if (startDate) {
    const start = parseISODate(startDate);
    start.setHours(0, 0, 0, 0); // Start of day
    if (fileDate < start) return false;
  }

  if (endDate) {
    const end = parseISODate(endDate);
    end.setHours(23, 59, 59, 999); // End of day
    if (fileDate > end) return false;
  }

  return true;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format the results as a readable text output
 */
function formatResults(matches: TranscriptMatch[]): string {
  if (matches.length === 0) {
    return "No meeting transcripts found matching your search criteria.";
  }

  const header = `Found ${matches.length} transcript${matches.length === 1 ? "" : "s"}:\n`;

  const formatted = matches.map((match) => {
    return [
      `\nFile: ${match.filename}`,
      `Path: ${match.filepath}`,
      `Size: ${formatFileSize(match.size)}`,
      `Modified: ${match.modifiedDate}`,
      `Source: ${match.sourceDirectory}`,
    ].join("\n");
  });

  return header + formatted.join("\n");
}

/**
 * Handler function for searching meeting transcripts
 */
async function searchMeetingTranscriptsHandler({
  topic,
  startDate,
  endDate,
}: {
  topic: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    // Validate inputs
    if (!topic || topic.trim().length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Topic parameter is required and cannot be empty",
          },
        ],
        isError: true,
      };
    }

    // Validate date formats if provided
    if (startDate) {
      parseISODate(startDate); // Will throw if invalid
    }
    if (endDate) {
      parseISODate(endDate); // Will throw if invalid
    }

    // Build glob pattern
    const pattern = buildGlobPattern(topic, SUPPORTED_EXTENSIONS);

    console.error(`[meeting-transcripts] Searching for pattern: ${pattern}`);
    console.error(
      `[meeting-transcripts] Date range: ${startDate || "any"} to ${endDate || "any"}`
    );

    // Search each directory
    const allMatches: TranscriptMatch[] = [];

    for (const dir of TRANSCRIPT_DIRS) {
      try {
        // Check if directory exists
        await fs.access(dir);

        console.error(`[meeting-transcripts] Searching directory: ${dir}`);

        // Search with glob
        const files = await glob(pattern, {
          cwd: dir,
          nocase: true, // Case-insensitive matching
          absolute: true,
          nodir: true, // Files only, no directories
        });

        console.error(`[meeting-transcripts] Found ${files.length} files in ${dir}`);

        // Get file stats and filter by date if needed
        for (const filepath of files) {
          try {
            const stats = await fs.stat(filepath);
            const modifiedDate = stats.mtime;

            // Apply date range filter
            if (!isWithinDateRange(modifiedDate, startDate, endDate)) {
              continue;
            }

            allMatches.push({
              filepath,
              filename: path.basename(filepath),
              size: stats.size,
              modifiedDate: modifiedDate.toISOString(),
              sourceDirectory: dir,
            });
          } catch (statError: any) {
            // Skip files we can't stat (permission issues, etc.)
            console.error(
              `[meeting-transcripts] Warning: Could not stat file ${filepath}: ${statError.message}`
            );
            continue;
          }
        }
      } catch (dirError: any) {
        // Directory doesn't exist or is not accessible
        console.error(
          `[meeting-transcripts] Warning: Could not access directory ${dir}: ${dirError.message}`
        );
        continue;
      }
    }

    // Sort by modified date (newest first)
    allMatches.sort(
      (a, b) =>
        new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime()
    );

    console.error(
      `[meeting-transcripts] Total matches after filtering: ${allMatches.length}`
    );

    // Format and return results
    const formattedResults = formatResults(allMatches);

    return {
      content: [
        {
          type: "text",
          text: formattedResults,
        },
      ],
    };
  } catch (error: any) {
    console.error(`[meeting-transcripts] Error: ${error.message}`);
    return {
      content: [
        {
          type: "text",
          text: `Error searching meeting transcripts: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Register the meeting transcript search tool with the MCP server
 */
export function registerMeetingTranscriptTools(server: McpServer) {
  server.tool(
    "search-meeting-transcripts",
    {
      topic: z
        .string()
        .describe("Meeting topic or name to search for in filenames"),
      startDate: z
        .string()
        .optional()
        .describe("Optional start date for filtering (ISO format: YYYY-MM-DD)"),
      endDate: z
        .string()
        .optional()
        .describe("Optional end date for filtering (ISO format: YYYY-MM-DD)"),
    },
    searchMeetingTranscriptsHandler as any
  );

  console.error("[meeting-transcripts] Meeting transcript search tool registered");
  console.error(
    `[meeting-transcripts] Configured directories: ${TRANSCRIPT_DIRS.join(", ")}`
  );
  console.error(
    `[meeting-transcripts] Supported extensions: ${SUPPORTED_EXTENSIONS.join(", ")}`
  );
}
