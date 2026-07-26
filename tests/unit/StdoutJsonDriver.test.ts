/**
 * Unit tests for StdoutJsonDriver.
 *
 * @packageDocumentation
 */

import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { StdoutJsonDriver } from "../../src/StdoutJsonDriver";

describe("StdoutJsonDriver", () => {
    afterEach(() => {
        // Restore mocks after each test
        // process.stdout.write is restored automatically if we use standard mock restoration
    });

    test("should format standard string message as JSON and write to stdout", () => {
        const writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));
        const driver = new StdoutJsonDriver();

        driver.write("info", "System started", { reqId: "abc" });

        expect(writeSpy).toHaveBeenCalled();
        const callArgs = writeSpy.mock.calls[0] as unknown[];
        const output = callArgs[1] as string; // in Bun.write(file, content), the payload is the second argument
        const parsed = JSON.parse(output);

        expect(parsed.level).toBe("info");
        expect(parsed.message).toBe("System started");
        expect(parsed.context).toEqual({ reqId: "abc" });
        expect(parsed.timestamp).toBeDefined();

        writeSpy.mockRestore();
    });

    test("should gracefully format Error objects", () => {
        const writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));
        const driver = new StdoutJsonDriver();

        const err = new Error("Database connection failed");
        driver.write("error", err);

        expect(writeSpy).toHaveBeenCalled();
        const callArgs = writeSpy.mock.calls[0] as unknown[];
        const output = callArgs[1] as string; // in Bun.write(file, content), the payload is the second arg
        const parsed = JSON.parse(output);

        expect(parsed.level).toBe("error");
        expect(parsed.message).toBe("Database connection failed");
        expect(parsed.err).toBeDefined();
        expect(parsed.err.name).toBe("Error");
        expect(parsed.err.message).toBe("Database connection failed");
        expect(parsed.err.stack).toBeDefined();

        writeSpy.mockRestore();
    });
});
