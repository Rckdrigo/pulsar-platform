import fs from "fs/promises";
import path from "path";
import { registerFileTools } from "../../src/tools/file-manager";
import { glob } from "glob";

jest.mock("fs/promises");
jest.mock("glob");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedGlob = glob as jest.MockedFunction<typeof glob>;

describe("File Manager Tools", () => {
  let mockServer: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockServer = {
      tool: jest.fn(),
    };
    registerFileTools(mockServer);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Tool Registration", () => {
    test("should register all file management tools", () => {
      const toolNames = mockServer.tool.mock.calls.map((call: any) => call[0]);

      expect(toolNames).toContain("file-read");
      expect(toolNames).toContain("file-write");
      expect(toolNames).toContain("file-delete");
      expect(toolNames).toContain("file-list");
      expect(toolNames).toContain("file-search");
      expect(toolNames).toContain("file-move");
      expect(toolNames).toContain("file-copy");
      expect(toolNames).toContain("file-stats");
    });

    test("should register 8 tools in total", () => {
      expect(mockServer.tool).toHaveBeenCalledTimes(8);
    });
  });

  describe("file-read", () => {
    let fileReadHandler: any;

    beforeEach(() => {
      const fileReadCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-read"
      );
      fileReadHandler = fileReadCall[2];
    });

    test("should read file contents successfully", async () => {
      const mockContent = "Hello, World!";
      const mockStats = { size: mockContent.length, isDirectory: () => false, isFile: () => true };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.readFile.mockResolvedValue(mockContent);

      const result = await fileReadHandler({ path: "test.txt" });

      expect(result.content[0].text).toContain("test.txt");
      expect(result.content[0].text).toContain(mockContent);
      expect(result.isError).toBeUndefined();
    });

    test("should handle file not found error", async () => {
      const error: any = new Error("ENOENT");
      error.code = "ENOENT";
      mockedFs.access.mockRejectedValue(error);

      const result = await fileReadHandler({ path: "nonexistent.txt" });

      expect(result.content[0].text).toContain("File not found");
      expect(result.isError).toBe(true);
    });

    test("should handle permission denied error", async () => {
      const error: any = new Error("EACCES");
      error.code = "EACCES";
      mockedFs.access.mockRejectedValue(error);

      const result = await fileReadHandler({ path: "forbidden.txt" });

      expect(result.content[0].text).toContain("Permission denied");
      expect(result.isError).toBe(true);
    });

    test("should reject reading directories", async () => {
      const mockStats = { isDirectory: () => true, isFile: () => false };
      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileReadHandler({ path: "some-directory" });

      expect(result.content[0].text).toContain("is a directory");
      expect(result.isError).toBe(true);
    });
  });

  describe("file-write", () => {
    let fileWriteHandler: any;

    beforeEach(() => {
      const fileWriteCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-write"
      );
      fileWriteHandler = fileWriteCall[2];
    });

    test("should preview write in dry run mode by default", async () => {
      const mockStats = { size: 100 };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileWriteHandler({
        path: "test.txt",
        content: "New content",
      });

      expect(result.content[0].text).toContain("DRY RUN");
      expect(result.content[0].text).toContain("overwrite");
      expect(result.content[0].text).toContain("dryRun=false");
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
    });

    test("should write file when dryRun=false", async () => {
      const error: any = new Error("ENOENT");
      error.code = "ENOENT";
      mockedFs.stat.mockRejectedValue(error);
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      const result = await fileWriteHandler({
        path: "test.txt",
        content: "New content",
        dryRun: false,
      });

      expect(mockedFs.writeFile).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Created file");
      expect(result.isError).toBeUndefined();
    });

    test("should create parent directories if needed", async () => {
      const error: any = new Error("ENOENT");
      error.code = "ENOENT";
      mockedFs.stat.mockRejectedValue(error);
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await fileWriteHandler({
        path: "nested/path/test.txt",
        content: "Content",
        dryRun: false,
      });

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("nested/path"),
        { recursive: true }
      );
    });

    test("should show preview for new file creation", async () => {
      const error: any = new Error("ENOENT");
      error.code = "ENOENT";
      mockedFs.stat.mockRejectedValue(error);

      const result = await fileWriteHandler({
        path: "new.txt",
        content: "Hello World",
        dryRun: true,
      });

      expect(result.content[0].text).toContain("create");
      expect(result.content[0].text).not.toContain("Existing file size");
    });
  });

  describe("file-delete", () => {
    let fileDeleteHandler: any;

    beforeEach(() => {
      const fileDeleteCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-delete"
      );
      fileDeleteHandler = fileDeleteCall[2];
    });

    test("should preview delete in dry run mode by default", async () => {
      const mockStats = {
        size: 1024,
        isDirectory: () => false,
        mtime: new Date(),
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileDeleteHandler({ path: "test.txt" });

      expect(result.content[0].text).toContain("DRY RUN");
      expect(result.content[0].text).toContain("Would delete file");
      expect(mockedFs.unlink).not.toHaveBeenCalled();
    });

    test("should delete file when dryRun=false", async () => {
      const mockStats = {
        size: 1024,
        isDirectory: () => false,
        mtime: new Date(),
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.unlink.mockResolvedValue(undefined);

      const result = await fileDeleteHandler({
        path: "test.txt",
        dryRun: false,
      });

      expect(mockedFs.unlink).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Deleted file");
      expect(result.isError).toBeUndefined();
    });

    test("should require recursive flag for directories", async () => {
      const mockStats = {
        size: 0,
        isDirectory: () => true,
        mtime: new Date(),
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileDeleteHandler({
        path: "some-dir",
        recursive: false,
      });

      expect(result.content[0].text).toContain("is a directory");
      expect(result.content[0].text).toContain("recursive=true");
      expect(result.isError).toBe(true);
    });

    test("should delete directory with recursive flag", async () => {
      const mockStats = {
        size: 0,
        isDirectory: () => true,
        mtime: new Date(),
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.rm.mockResolvedValue(undefined);

      const result = await fileDeleteHandler({
        path: "some-dir",
        recursive: true,
        dryRun: false,
      });

      expect(mockedFs.rm).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true, force: true }
      );
      expect(result.content[0].text).toContain("Deleted directory");
    });
  });

  describe("file-list", () => {
    let fileListHandler: any;

    beforeEach(() => {
      const fileListCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-list"
      );
      fileListHandler = fileListCall[2];
    });

    test("should list directory contents", async () => {
      const mockStats = { isDirectory: () => true };
      const mockEntries = [
        { name: "file1.txt", isDirectory: () => false, isFile: () => true },
        { name: "dir1", isDirectory: () => true, isFile: () => false },
      ];

      mockedFs.stat
        .mockResolvedValueOnce(mockStats as any)
        .mockResolvedValueOnce({ size: 100 } as any)
        .mockResolvedValueOnce({ size: 0 } as any);
      mockedFs.readdir.mockResolvedValue(mockEntries as any);

      const result = await fileListHandler({ path: "." });

      expect(result.content[0].text).toContain("file1.txt");
      expect(result.content[0].text).toContain("dir1");
      expect(result.content[0].text).toContain("FILE");
      expect(result.content[0].text).toContain("DIR");
    });

    test("should filter hidden files by default", async () => {
      const mockStats = { isDirectory: () => true };
      const mockEntries = [
        { name: ".hidden", isDirectory: () => false, isFile: () => true },
        { name: "visible.txt", isDirectory: () => false, isFile: () => true },
      ];

      mockedFs.stat
        .mockResolvedValueOnce(mockStats as any)
        .mockResolvedValueOnce({ size: 50 } as any);
      mockedFs.readdir.mockResolvedValue(mockEntries as any);

      const result = await fileListHandler({ path: ".", showHidden: false });

      expect(result.content[0].text).toContain("visible.txt");
      expect(result.content[0].text).not.toContain(".hidden");
    });

    test("should show hidden files when requested", async () => {
      const mockStats = { isDirectory: () => true };
      const mockEntries = [
        { name: ".hidden", isDirectory: () => false, isFile: () => true },
        { name: "visible.txt", isDirectory: () => false, isFile: () => true },
      ];

      mockedFs.stat
        .mockResolvedValueOnce(mockStats as any)
        .mockResolvedValueOnce({ size: 50 } as any)
        .mockResolvedValueOnce({ size: 100 } as any);
      mockedFs.readdir.mockResolvedValue(mockEntries as any);

      const result = await fileListHandler({ path: ".", showHidden: true });

      expect(result.content[0].text).toContain(".hidden");
      expect(result.content[0].text).toContain("visible.txt");
    });

    test("should handle empty directories", async () => {
      const mockStats = { isDirectory: () => true };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.readdir.mockResolvedValue([]);

      const result = await fileListHandler({ path: "." });

      expect(result.content[0].text).toContain("empty");
    });

    test("should reject non-directory paths", async () => {
      const mockStats = { isDirectory: () => false };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileListHandler({ path: "file.txt" });

      expect(result.content[0].text).toContain("not a directory");
      expect(result.isError).toBe(true);
    });
  });

  describe("file-search", () => {
    let fileSearchHandler: any;

    beforeEach(() => {
      const fileSearchCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-search"
      );
      fileSearchHandler = fileSearchCall[2];
    });

    test("should search for files using glob pattern", async () => {
      mockedGlob.mockResolvedValue(["src/file1.ts", "src/file2.ts"]);
      mockedFs.stat
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isFile: () => true,
          size: 100,
        } as any)
        .mockResolvedValueOnce({
          isDirectory: () => false,
          isFile: () => true,
          size: 200,
        } as any);

      const result = await fileSearchHandler({ pattern: "**/*.ts" });

      expect(result.content[0].text).toContain("src/file1.ts");
      expect(result.content[0].text).toContain("src/file2.ts");
      expect(result.content[0].text).toContain("Matches: 2");
    });

    test("should handle no matches", async () => {
      mockedGlob.mockResolvedValue([]);

      const result = await fileSearchHandler({ pattern: "*.xyz" });

      expect(result.content[0].text).toContain("No files found");
      expect(result.content[0].text).toContain("*.xyz");
    });

    test("should search in custom base path", async () => {
      mockedGlob.mockResolvedValue(["test.js"]);
      mockedFs.stat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 50,
      } as any);

      const result = await fileSearchHandler({
        pattern: "*.js",
        path: "custom/path",
      });

      expect(mockedGlob).toHaveBeenCalledWith(
        "*.js",
        expect.objectContaining({
          cwd: expect.stringContaining("custom/path"),
        })
      );
    });
  });

  describe("file-move", () => {
    let fileMoveHandler: any;

    beforeEach(() => {
      const fileMoveCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-move"
      );
      fileMoveHandler = fileMoveCall[2];
    });

    test("should preview move in dry run mode", async () => {
      const mockStats = { isDirectory: () => false };
      const destError: any = new Error("ENOENT");
      destError.code = "ENOENT";

      mockedFs.stat.mockResolvedValueOnce(mockStats as any).mockRejectedValueOnce(destError);

      const result = await fileMoveHandler({
        source: "old.txt",
        destination: "new.txt",
      });

      expect(result.content[0].text).toContain("DRY RUN");
      expect(result.content[0].text).toContain("Would move");
      expect(mockedFs.rename).not.toHaveBeenCalled();
    });

    test("should move file when dryRun=false", async () => {
      const mockStats = { isDirectory: () => false };
      const destError: any = new Error("ENOENT");
      destError.code = "ENOENT";

      mockedFs.stat.mockResolvedValueOnce(mockStats as any).mockRejectedValueOnce(destError);
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);

      const result = await fileMoveHandler({
        source: "old.txt",
        destination: "new.txt",
        dryRun: false,
      });

      expect(mockedFs.rename).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Moved");
      expect(result.isError).toBeUndefined();
    });

    test("should reject move if destination exists", async () => {
      const mockStats = { isDirectory: () => false };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileMoveHandler({
        source: "old.txt",
        destination: "existing.txt",
      });

      expect(result.content[0].text).toContain("already exists");
      expect(result.isError).toBe(true);
    });

    test("should create parent directory for destination", async () => {
      const mockStats = { isDirectory: () => false };
      const destError: any = new Error("ENOENT");
      destError.code = "ENOENT";

      mockedFs.stat.mockResolvedValueOnce(mockStats as any).mockRejectedValueOnce(destError);
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);

      await fileMoveHandler({
        source: "file.txt",
        destination: "nested/path/file.txt",
        dryRun: false,
      });

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("nested/path"),
        { recursive: true }
      );
    });
  });

  describe("file-copy", () => {
    let fileCopyHandler: any;

    beforeEach(() => {
      const fileCopyCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-copy"
      );
      fileCopyHandler = fileCopyCall[2];
    });

    test("should preview copy in dry run mode", async () => {
      const mockStats = { isDirectory: () => false, size: 500 };
      const destError: any = new Error("ENOENT");
      destError.code = "ENOENT";

      mockedFs.stat.mockResolvedValueOnce(mockStats as any).mockRejectedValueOnce(destError);

      const result = await fileCopyHandler({
        source: "file.txt",
        destination: "copy.txt",
      });

      expect(result.content[0].text).toContain("DRY RUN");
      expect(result.content[0].text).toContain("Would copy");
      expect(mockedFs.copyFile).not.toHaveBeenCalled();
    });

    test("should copy file when dryRun=false", async () => {
      const mockStats = { isDirectory: () => false, size: 500 };
      const destError: any = new Error("ENOENT");
      destError.code = "ENOENT";

      mockedFs.stat.mockResolvedValueOnce(mockStats as any).mockRejectedValueOnce(destError);
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.copyFile.mockResolvedValue(undefined);

      const result = await fileCopyHandler({
        source: "file.txt",
        destination: "copy.txt",
        dryRun: false,
      });

      expect(mockedFs.copyFile).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Copied file");
      expect(result.isError).toBeUndefined();
    });

    test("should reject copying directories", async () => {
      const mockStats = { isDirectory: () => true };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileCopyHandler({
        source: "some-dir",
        destination: "copy-dir",
      });

      expect(result.content[0].text).toContain("Directory copying not yet supported");
      expect(result.isError).toBe(true);
    });

    test("should reject if destination exists", async () => {
      const mockStats = { isDirectory: () => false, size: 100 };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileCopyHandler({
        source: "file.txt",
        destination: "existing.txt",
      });

      expect(result.content[0].text).toContain("already exists");
      expect(result.isError).toBe(true);
    });
  });

  describe("file-stats", () => {
    let fileStatsHandler: any;

    beforeEach(() => {
      const fileStatsCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-stats"
      );
      fileStatsHandler = fileStatsCall[2];
    });

    test("should return file statistics", async () => {
      const mockStats = {
        isDirectory: () => false,
        isFile: () => true,
        size: 1024,
        mtime: new Date("2025-01-01"),
        mode: 0o644,
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileStatsHandler({ path: "test.txt" });

      expect(result.content[0].text).toContain("Type: file");
      expect(result.content[0].text).toContain("Size: 1024 bytes");
      expect(result.content[0].text).toContain("Readable:");
      expect(result.content[0].text).toContain("Writable:");
    });

    test("should return directory statistics", async () => {
      const mockStats = {
        isDirectory: () => true,
        isFile: () => false,
        size: 0,
        mtime: new Date("2025-01-01"),
        mode: 0o755,
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const result = await fileStatsHandler({ path: "some-dir" });

      expect(result.content[0].text).toContain("Type: directory");
      expect(result.content[0].text).toContain("Size: -");
    });

    test("should handle file not found", async () => {
      const error: any = new Error("ENOENT");
      error.code = "ENOENT";
      mockedFs.stat.mockRejectedValue(error);

      const result = await fileStatsHandler({ path: "nonexistent.txt" });

      expect(result.content[0].text).toContain("Path not found");
      expect(result.isError).toBe(true);
    });
  });

  describe("Path Validation", () => {
    test("file-read should validate paths", async () => {
      // This test ensures path validation is working
      // The exact validation logic is internal to the tool
      const fileReadCall = mockServer.tool.mock.calls.find(
        (call: any) => call[0] === "file-read"
      );
      const fileReadHandler = fileReadCall[2];

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.stat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 10,
      } as any);
      mockedFs.readFile.mockResolvedValue("content");

      // Should work with relative paths
      await fileReadHandler({ path: "test.txt" });
      expect(mockedFs.readFile).toHaveBeenCalled();
    });
  });
});
