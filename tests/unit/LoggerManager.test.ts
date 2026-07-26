/**
 * Unit tests for LoggerManager.
 *
 * @packageDocumentation
 */

import { describe, expect, mock, test } from "bun:test";
import type { LogDriverInterface } from "../../src/contracts/LogDriverInterface";
import type { LogLevel } from "../../src/contracts/LogLevel";
import { LoggerManager } from "../../src/LoggerManager";

describe("LoggerManager", () => {
    test("should delegate trace calls to the underlying driver", () => {
        const mockWrite = mock((_level: LogLevel, _message: string | Error, _context?: Record<string, unknown>) => {});
        const dummyDriver: LogDriverInterface = { write: mockWrite };

        const logger = new LoggerManager(dummyDriver);

        logger.trace("Hello Trace", { user: 123 });
        expect(mockWrite).toHaveBeenCalledWith("trace", "Hello Trace", {
            user: 123,
        });
    });

    test("should delegate debug calls to the underlying driver", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        logger.debug("Debug msg");
        expect(mockWrite).toHaveBeenCalledWith("debug", "Debug msg", undefined);
    });

    test("should delegate info calls to the underlying driver", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        logger.info("Info msg", { action: "start" });
        expect(mockWrite).toHaveBeenCalledWith("info", "Info msg", {
            action: "start",
        });
    });

    test("should delegate warn calls", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        logger.warn("Warning");
        expect(mockWrite).toHaveBeenCalledWith("warn", "Warning", undefined);
    });

    test("should delegate error calls", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        const err = new Error("Failed");
        logger.error(err);
        expect(mockWrite).toHaveBeenCalledWith("error", err, undefined);
    });

    test("should delegate fatal calls", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        logger.fatal("Fatal crash");
        expect(mockWrite).toHaveBeenCalledWith("fatal", "Fatal crash", undefined);
    });

    test("log method should delegate to write", () => {
        const mockWrite = mock();
        const logger = new LoggerManager({ write: mockWrite });
        logger.log("info", "Generic log");
        expect(mockWrite).toHaveBeenCalledWith("info", "Generic log", undefined);
    });
});
