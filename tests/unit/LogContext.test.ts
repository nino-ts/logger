/**
 * Unit tests for LogContext concurrency.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "bun:test";
import { addContext, getContext, runWithContext } from "../../src/LogContext";

describe("LogContext", () => {
    test("should return undefined when outside of context", () => {
        expect(getContext()).toBeUndefined();
    });

    test("should provide the associated context inside execution", () => {
        runWithContext({ reqId: "123" }, () => {
            expect(getContext()).toEqual({ reqId: "123" });
        });
    });

    test("should allow modifying context inside execution", () => {
        runWithContext({ reqId: "abc" }, () => {
            addContext({ userId: 42 });
            expect(getContext()).toEqual({ reqId: "abc", userId: 42 });
        });
    });

    test("should support nested contexts independently", () => {
        runWithContext({ root: true }, () => {
            runWithContext({ nested: true }, () => {
                expect(getContext()).toEqual({ nested: true });
            });
            expect(getContext()).toEqual({ root: true });
        });
    });

    test("should isolate concurrent async contexts", async () => {
        const task1 = new Promise<void>((resolve) => {
            runWithContext({ name: "Task1" }, async () => {
                await Bun.sleep(10);
                addContext({ done: true });
                expect(getContext()).toEqual({ done: true, name: "Task1" });
                resolve();
            });
        });

        const task2 = new Promise<void>((resolve) => {
            runWithContext({ name: "Task2" }, async () => {
                await Bun.sleep(5);
                expect(getContext()).toEqual({ name: "Task2" });
                resolve();
            });
        });

        await Promise.all([task1, task2]);
        expect(getContext()).toBeUndefined(); // Ensure global state is unpolluted
    });
});
