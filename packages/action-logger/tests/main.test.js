const Logger = require("../index.js");

// Mock @actions/core
jest.mock("@actions/core", () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  setFailed: jest.fn(),
}));

const core = require("@actions/core");

describe("Logger", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset logger state//
    Logger.debugMode = false;
    Logger.dryRunMode = false;
  });

  describe("Constructor and initial state", () => {
    test("should initialize with debug and dry-run modes disabled", () => {
      expect(Logger.debugMode).toBe(false);
      expect(Logger.dryRunMode).toBe(false);
    });
  });

  describe("setDebug", () => {
    test("should enable debug mode and log debug message", () => {
      Logger.setDebug(true);
      expect(Logger.debugMode).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining("[debug] Debug mode enabled"),
      );
    });

    test("should disable debug mode and log debug message", () => {
      Logger.debugMode = true;
      Logger.setDebug(false);
      expect(Logger.debugMode).toBe(false);
      expect(core.info).not.toHaveBeenCalledWith(
        expect.stringContaining("[debug] Debug mode disabled"),
      );
    });

    test("should convert truthy values to boolean", () => {
      Logger.setDebug("yes");
      expect(Logger.debugMode).toBe(true);
    });
  });

  describe("setDryRun", () => {
    test("should enable dry-run mode and log debug message", () => {
      Logger.debugMode = true;
      Logger.setDryRun(true);
      expect(Logger.dryRunMode).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining("[debug] Dry-run mode enabled"),
      );
    });

    test("should disable dry-run mode and log debug message", () => {
      Logger.debugMode = true;
      Logger.dryRunMode = true;
      Logger.setDryRun(false);
      expect(Logger.dryRunMode).toBe(false);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining("[debug] Dry-run mode disabled"),
      );
    });
  });

  describe("Logging methods", () => {
    test("info should call core.info with blue color", () => {
      Logger.info("test message");
      expect(core.info).toHaveBeenCalledWith("\x1b[34mtest message\x1b[0m");
    });

    test("success should call core.info with green color", () => {
      Logger.success("test message");
      expect(core.info).toHaveBeenCalledWith("\x1b[32mtest message\x1b[0m");
    });

    test("warn should call core.warning with yellow color", () => {
      Logger.warn("test message");
      expect(core.warning).toHaveBeenCalledWith("\x1b[33mtest message\x1b[0m");
    });

    test("error should call core.error with red color", () => {
      Logger.error("test message");
      expect(core.error).toHaveBeenCalledWith("\x1b[31mtest message\x1b[0m");
    });

    test("dim should call core.info with gray color", () => {
      Logger.dim("test message");
      expect(core.info).toHaveBeenCalledWith("\x1b[90mtest message\x1b[0m");
    });

    test("plain should call core.info without colors", () => {
      Logger.plain("test message");
      expect(core.info).toHaveBeenCalledWith("test message");
    });
  });

  describe("Grouping", () => {
    test("group should start group with blue color", () => {
      Logger.group("test group");
      expect(core.startGroup).toHaveBeenCalledWith("\x1b[34mtest group\x1b[0m");
    });

    test("endGroup should end group", () => {
      Logger.endGroup();
      expect(core.endGroup).toHaveBeenCalled();
    });
  });

  describe("Debug functionality", () => {
    test("debug should not log when debug mode is disabled", () => {
      Logger.debug("debug message");
      expect(core.info).not.toHaveBeenCalled();
      expect(core.debug).not.toHaveBeenCalled();
    });

    test("debug should log when debug mode is enabled", () => {
      Logger.debugMode = true;
      Logger.debug("debug message");
      expect(core.info).toHaveBeenCalledWith(
        "\x1b[90m[debug] debug message\x1b[0m",
      );
      expect(core.debug).toHaveBeenCalledWith("debug message");
    });

    test("debugJSON should not log when debug mode is disabled", () => {
      Logger.debugJSON("test", { key: "value" });
      expect(core.info).not.toHaveBeenCalled();
    });

    test("debugJSON should log formatted JSON when debug mode is enabled", () => {
      Logger.debugMode = true;
      const obj = { key: "value", nested: { prop: 123 } };
      Logger.debugJSON("test object", obj);

      const expectedJson = JSON.stringify(obj, null, 2);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`[debug] test object:\n${expectedJson}`),
      );
    });
  });

  describe("Dry-run functionality", () => {
    test("dryrun should not log when dry-run mode is disabled", () => {
      Logger.dryrun("dry run message");
      expect(core.info).not.toHaveBeenCalled();
    });

    test("dryrun should log when dry-run mode is enabled", () => {
      Logger.dryRunMode = true;
      Logger.dryrun("dry run message");
      expect(core.info).toHaveBeenCalledWith(
        "\x1b[90m[dry-run] dry run message\x1b[0m",
      );
    });
  });

  describe("Fail functionality", () => {
    test("fail should call core.setFailed", () => {
      Logger.fail("error message");
      expect(core.setFailed).toHaveBeenCalledWith("error message");
    });
  });

  describe("Integration tests", () => {
    test("should handle mixed debug and dry-run modes", () => {
      Logger.setDebug(true);
      Logger.setDryRun(true);

      Logger.dryrun("test dry run");
      Logger.debug("test debug");

      expect(core.info).toHaveBeenCalledTimes(4); // 2 for mode changes, 2 for messages
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining("[dry-run] test dry run"),
      );
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining("[debug] test debug"),
      );
    });
  });
});
