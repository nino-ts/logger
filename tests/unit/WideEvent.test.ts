/**
 * Unit tests for Wide Event / Canonical Log Line API.
 *
 * @packageDocumentation
 */

import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { addContext, getContext, runWithContext } from "../../src/LogContext";
import { createWideEvent, wideEvent } from "../../src/WideEvent";

function parseWriteCall(writeSpy: ReturnType<typeof spyOn>, index: number): Record<string, unknown> {
    const args = writeSpy.mock.calls[index] as unknown[];
    const payload = args[1];
    if (typeof payload !== "string") {
        throw new Error(`Expected Bun.write string payload at call ${index}`);
    }
    return JSON.parse(payload) as Record<string, unknown>;
}

describe("WideEvent", () => {
    let writeSpy: ReturnType<typeof spyOn>;

    afterEach(() => {
        writeSpy?.mockRestore();
    });

    test("createWideEvent seeds request_id, timestamp, method, path", () => {
        const event = createWideEvent({
            method: "GET",
            path: "/health",
            request_id: "req-fixed",
            timestamp: "2026-07-16T12:00:00.000Z",
        });

        expect(event.fields).toEqual({
            request_id: "req-fixed",
            timestamp: "2026-07-16T12:00:00.000Z",
            method: "GET",
            path: "/health",
        });
    });

    test("createWideEvent generates request_id when omitted", () => {
        const event = createWideEvent({ method: "POST", path: "/users" });
        expect(typeof event.fields.request_id).toBe("string");
        expect(String(event.fields.request_id).length).toBeGreaterThan(0);
        expect(typeof event.fields.timestamp).toBe("string");
    });

    test("emit writes exactly one flat JSON line with minimal fields", () => {
        writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const event = createWideEvent({
            method: "GET",
            path: "/api",
            request_id: "r-1",
            timestamp: "2026-07-16T12:00:00.000Z",
        });
        event.set({
            status_code: 200,
            duration_ms: 12,
            outcome: "success",
        });
        event.emit();

        expect(writeSpy).toHaveBeenCalledTimes(1);
        const line = parseWriteCall(writeSpy, 0);
        expect(line).toEqual({
            request_id: "r-1",
            timestamp: "2026-07-16T12:00:00.000Z",
            method: "GET",
            path: "/api",
            status_code: 200,
            duration_ms: 12,
            outcome: "success",
        });
        expect(line).not.toHaveProperty("message");
        expect(line).not.toHaveProperty("context");
        expect(line).not.toHaveProperty("level");
    });

    test("set enriches fields before emit", () => {
        writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const event = createWideEvent({
            method: "GET",
            path: "/",
            request_id: "r-2",
            timestamp: "2026-07-16T12:00:00.000Z",
        });
        event.set({ user_id: "u-99", route: "home" });
        event.set({ status_code: 200, duration_ms: 3, outcome: "success" });
        event.emit();

        const line = parseWriteCall(writeSpy, 0);
        expect(line.user_id).toBe("u-99");
        expect(line.route).toBe("home");
        expect(line.outcome).toBe("success");
    });

    test("error outcome includes error.type and error.message", () => {
        writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const event = createWideEvent({
            method: "POST",
            path: "/fail",
            request_id: "r-err",
            timestamp: "2026-07-16T12:00:00.000Z",
        });
        event.set({
            status_code: 500,
            duration_ms: 8,
            outcome: "error",
            error: { type: "TypeError", message: "boom" },
        });
        event.emit();

        const line = parseWriteCall(writeSpy, 0);
        expect(line.outcome).toBe("error");
        expect(line.error).toEqual({ type: "TypeError", message: "boom" });
    });

    test("emit is once — second emit is still one write per call (caller discipline)", () => {
        writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const event = createWideEvent({
            method: "GET",
            path: "/once",
            request_id: "r-once",
            timestamp: "2026-07-16T12:00:00.000Z",
        });
        event.set({ status_code: 200, duration_ms: 1, outcome: "success" });
        event.emit();
        expect(writeSpy).toHaveBeenCalledTimes(1);
    });

    test("wideEvent.set aliases addContext inside runWithContext", () => {
        const event = createWideEvent({
            method: "GET",
            path: "/ctx",
            request_id: "r-ctx",
        });

        runWithContext(event.fields, () => {
            wideEvent.set({ user_id: 7 });
            expect(getContext()?.user_id).toBe(7);
            addContext({ role: "admin" });
            expect(getContext()).toMatchObject({
                request_id: "r-ctx",
                user_id: 7,
                role: "admin",
            });
        });
    });

    test("wideEvent.emit writes the ALS store as one canonical line", () => {
        writeSpy = spyOn(Bun, "write").mockImplementation(() => Promise.resolve(100));

        const event = createWideEvent({
            method: "DELETE",
            path: "/x",
            request_id: "r-als",
            timestamp: "2026-07-16T12:00:00.000Z",
        });

        runWithContext(event.fields, () => {
            wideEvent.set({ status_code: 204, duration_ms: 2, outcome: "success" });
            wideEvent.emit();
        });

        expect(writeSpy).toHaveBeenCalledTimes(1);
        const line = parseWriteCall(writeSpy, 0);
        expect(line.request_id).toBe("r-als");
        expect(line.status_code).toBe(204);
        expect(line.outcome).toBe("success");
    });
});
