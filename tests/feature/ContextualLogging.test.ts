/**
 * Feature tests validating end-to-end contextual logging injection.
 *
 * @packageDocumentation
 */

import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { addContext, runWithContext } from "../../src/LogContext";
import { LoggerManager } from "../../src/LoggerManager";
import { StdoutJsonDriver } from "../../src/StdoutJsonDriver";

describe("Contextual Logging Integration", () => {
    afterEach(() => {
        // Spy auto-restores in some bun versions, but we'll leave this block for cleanliness
    });

    test("should inject AsyncLocalStorage metadata automatically into standard output stream", async () => {
        const writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const driver = new StdoutJsonDriver();
        const logger = new LoggerManager(driver);

        await new Promise<void>((resolve) => {
            runWithContext({ requestId: "r-1234" }, () => {
                logger.info("Handling request");
                addContext({ userId: "u-5678" });
                logger.warn("User missing permissions", { action: "delete" });
                resolve();
            });
        });

        expect(writeSpy).toHaveBeenCalledTimes(2);

        const parseCall = (index: number) => {
            const args = writeSpy.mock.calls[index] as unknown[];
            // Bun.write(file, string) so arg[1] is the text content
            return JSON.parse(args[1] as string);
        };

        const firstCallJson = parseCall(0);
        const secondCallJson = parseCall(1);

        // Initial logging
        expect(firstCallJson.message).toBe("Handling request");
        expect(firstCallJson.context).toEqual({ requestId: "r-1234" });

        // Merged logging after addContext and local context override
        expect(secondCallJson.message).toBe("User missing permissions");
        expect(secondCallJson.context).toEqual({
            action: "delete",
            requestId: "r-1234",
            userId: "u-5678",
        });

        writeSpy.mockRestore();
    });
});
