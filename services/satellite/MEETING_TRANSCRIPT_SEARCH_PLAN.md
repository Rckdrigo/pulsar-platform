# Meeting Transcript Search Tool - Implementation Plan

## Overview

Add a new MCP tool to the Satellite server for searching meeting transcripts across hardcoded directories using filename-based regex pattern matching with optional date range filtering.

## Feature Specification

### Tool Name
`search-meeting-transcripts`

### Purpose
Enable users to quickly find meeting transcripts by topic/name across multiple directories without needing to manually search through file systems.

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Meeting topic or name to search for in filenames |
| `startDate` | string | No | Start date for filtering (ISO format: YYYY-MM-DD) |
| `endDate` | string | No | End date for filtering (ISO format: YYYY-MM-DD) |

### Output Format

Returns file details for matching transcripts:
- File path (absolute)
- Filename
- File size (bytes)
- Modified date (ISO format)
- Source directory

Results sorted by modified date (newest first).

### Example Usage

```typescript
// Search for "team meeting" transcripts
{
  "topic": "team meeting"
}

// Search with date range
{
  "topic": "standup",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Example Response

```
Found 3 transcript(s):

File: 2025-01-15-team-meeting-notes.md
Path: /Users/user/meetings/2025-01-15-team-meeting-notes.md
Size: 4521 bytes
Modified: 2025-01-15T14:30:00.000Z

File: Team Meeting - Q1 Planning - 2025-01-08.txt
Path: /Users/user/transcripts/Team Meeting - Q1 Planning - 2025-01-08.txt
Size: 3892 bytes
Modified: 2025-01-08T10:15:00.000Z

File: team_meeting_2025-01-05.md
Path: /Users/user/meetings/team_meeting_2025-01-05.md
Size: 2134 bytes
Modified: 2025-01-05T16:45:00.000Z
```

## Implementation Details

### 1. File Structure

**New File:** `src/tools/meeting-transcripts.ts`

Contains:
- Handler function: `searchMeetingTranscriptsHandler`
- Registration function: `registerMeetingTranscriptTools`
- Hardcoded directory constants

**Modified File:** `src/server.ts`

Add:
- Import statement for registration function
- Registration call in `createMcpServer()`

### 2. Search Strategy

#### Filename Pattern Matching
- Convert topic to flexible glob pattern
  - Example: "team meeting" → `**/*team*meeting*`
  - Handles spaces, word order variations
- Search file extensions: `.txt`, `.md`, `.pdf`, `.docx`
- Case-insensitive matching

#### Date Range Filtering
- Use file modification timestamp (`stats.mtime`)
- Apply filtering after initial glob search
- Both `startDate` and `endDate` are inclusive

#### Multi-Directory Search
```typescript
const TRANSCRIPT_DIRS = [
  "/path/to/dirA",  // Placeholder - update with actual path
  "/path/to/dirB"   // Placeholder - update with actual path
];
```

### 3. Code Implementation Pattern

Following existing satellite MCP tool patterns:

```typescript
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

// Hardcoded directories
const TRANSCRIPT_DIRS = [
  "/path/to/dirA",
  "/path/to/dirB"
];

async function searchMeetingTranscriptsHandler({
  topic,
  startDate,
  endDate
}: {
  topic: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    // 1. Build glob pattern from topic
    // 2. Search each directory
    // 3. Get file stats for metadata
    // 4. Filter by date range if provided
    // 5. Sort by modified date
    // 6. Format and return results
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
}

export function registerMeetingTranscriptTools(server: McpServer) {
  server.tool(
    "search-meeting-transcripts",
    {
      topic: z.string().describe("Meeting topic or name to search for"),
      startDate: z.string().optional().describe("Optional start date (ISO format: YYYY-MM-DD)"),
      endDate: z.string().optional().describe("Optional end date (ISO format: YYYY-MM-DD)")
    },
    searchMeetingTranscriptsHandler as any
  );

  console.error("Meeting transcript tools registered");
}
```

### 4. Dependencies

All required dependencies already available:
- `glob` - Pattern matching
- `fs/promises` - Async file operations
- `path` - Path manipulation
- `zod` - Schema validation
- `@modelcontextprotocol/sdk` - MCP server framework

### 5. Error Handling

Handle common scenarios:
- Directory doesn't exist (ENOENT)
- Permission denied (EACCES)
- Invalid date format
- No matches found (return friendly message, not error)
- Malformed patterns

## Implementation Steps

1. **Create tool file** (`src/tools/meeting-transcripts.ts`)
   - Define constants for directories
   - Implement handler function
   - Implement registration function
   - Add comprehensive error handling

2. **Register tool** (modify `src/server.ts`)
   - Import registration function
   - Call in `createMcpServer()`

3. **Test the tool**
   - Test with various topic patterns
   - Test with date ranges
   - Test with no matches
   - Test with invalid inputs
   - Test across both directories

4. **Update directory paths**
   - Replace placeholders with actual paths
   - Verify directories exist and are readable

## Testing Approach

### Manual Testing

```bash
# Test basic search
mcp-client call search-meeting-transcripts '{"topic": "standup"}'

# Test with date range
mcp-client call search-meeting-transcripts '{
  "topic": "retrospective",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}'

# Test edge cases
mcp-client call search-meeting-transcripts '{"topic": "nonexistent"}'
```

### Test Cases

1. **Basic search** - Find transcripts by topic name
2. **Multi-word topic** - "team meeting" handles spaces
3. **Date filtering** - Only return files in range
4. **No matches** - Friendly "not found" message
5. **Mixed formats** - Handles various filename patterns
6. **Both directories** - Results from dirA and dirB
7. **Sorting** - Newest first

## Future Enhancements

### Phase 2 Improvements
- **Configurable directories** - Accept directories as parameters
- **Content search** - Search within file contents, not just filenames
- **Advanced filters** - File size, file type, participants
- **Fuzzy matching** - Handle typos and variations
- **Result pagination** - Limit results for large searches
- **File preview** - Return first N lines of content
- **Caching** - Cache directory listings for performance

### Phase 3 Improvements
- **Full-text search** - Index file contents with search engine
- **Meeting metadata** - Extract dates, participants from content
- **Related transcripts** - Find related/follow-up meetings
- **Export results** - Generate summary reports
- **Integration** - Connect with calendar APIs for meeting context

## Configuration

### Environment Variables (Future)
```bash
# Optional: Override default directories
TRANSCRIPT_DIR_A=/custom/path/to/meetings
TRANSCRIPT_DIR_B=/custom/path/to/transcripts
```

### Current Implementation
Directories hardcoded in `TRANSCRIPT_DIRS` constant. Update directly in code.

## Security Considerations

- **Path traversal** - Ensure search stays within configured directories
- **Permission checks** - Handle access denied gracefully
- **Input validation** - Sanitize topic input to prevent injection
- **File size limits** - Don't load large files into memory (metadata only)

## Maintenance Notes

- **Directory updates** - Update `TRANSCRIPT_DIRS` constant when paths change
- **File extensions** - Modify glob pattern to support additional formats
- **Performance** - Monitor search times for large directories
- **Logging** - Use stderr for debug logging (MCP convention)

## References

- **MCP SDK Documentation** - https://github.com/modelcontextprotocol/sdk
- **Satellite MCP Server** - `/Users/rckdrigo/Projects/pulsar-interactive/satellite/`
- **Existing file tools** - `src/tools/file-manager.ts` (reference implementation)
- **Server setup** - `src/server.ts` (tool registration)

## Implementation Checklist

- [ ] Create `src/tools/meeting-transcripts.ts`
- [ ] Implement `searchMeetingTranscriptsHandler` function
- [ ] Implement `registerMeetingTranscriptTools` function
- [ ] Add Zod schema validation
- [ ] Add error handling
- [ ] Update `src/server.ts` with import and registration
- [ ] Test with sample data
- [ ] Update directory paths from placeholders
- [ ] Verify tool appears in MCP tool list
- [ ] Document usage in README (if applicable)
- [ ] Test edge cases (no matches, invalid dates, etc.)

---

**Status:** Planning complete, ready for implementation
**Created:** 2025-11-10
**Version:** 1.0
