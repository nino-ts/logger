/**
 * Wide Event / Canonical Log Line API.
 *
 * Accumulate request lifecycle fields, then emit **once** (Logging Sucks).
 * Structured JSON ≠ Wide — this is one high-dimensionality event per request.
 *
 * @packageDocumentation
 */

import { addContext, getContext } from "./LogContext";

/**
 * Discriminant for request outcome on the canonical line.
 */
type WideEventOutcome = "success" | "error";

/**
 * Error detail required when `outcome === "error"`.
 */
type WideEventErrorFields = {
    type: string;
    message: string;
};

/**
 * Minimal fields always present on a Wide Event emit (Sprint 9 binding).
 */
type WideEvent = {
    request_id: string;
    timestamp: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    outcome: WideEventOutcome;
    error?: WideEventErrorFields;
};

/**
 * Initial request identity for {@link createWideEvent}.
 * Status / duration / outcome are filled before {@link WideEventHandle.emit}.
 */
type WideEventInit = {
    method: string;
    path: string;
    request_id?: string;
    timestamp?: string;
};

/**
 * Mutable wide-event store with mid-request enrichment and single emit.
 */
type WideEventHandle = {
    /** Mutable field bag (also used as AsyncLocalStorage store). */
    readonly fields: Record<string, unknown>;
    /**
     * Enrich the event mid-request (business fields, error, etc.).
     * Also merges into ALS via {@link addContext} when a store is active.
     */
    set(fields: Record<string, unknown>): void;
    /**
     * Serialize **one** flat JSON line via `Bun.write(Bun.stdout, …)`.
     * Call only from middleware `finally`.
     */
    emit(): void;
};

/**
 * Module-level enrichment helpers that mutate the active ALS store.
 * Prefer {@link WideEventHandle.set} when you hold the handle; `wideEvent.set`
 * is the documented alias over {@link addContext} for handlers.
 */
const wideEvent = {
    set(fields: Record<string, unknown>): void {
        addContext(fields);
    },
    emit(): void {
        const store = getContext();
        if (!store) {
            return;
        }
        writeCanonicalLine(store);
    },
};

/**
 * Creates the initial mutable store for a request-scoped wide event.
 *
 * @param init - HTTP method / path and optional id / timestamp
 * @returns Handle with `set` / `emit` — pass `fields` to `runWithContext`
 */
function createWideEvent(init: WideEventInit): WideEventHandle {
    const fields: Record<string, unknown> = {
        request_id: init.request_id ?? crypto.randomUUID(),
        timestamp: init.timestamp ?? new Date().toISOString(),
        method: init.method,
        path: init.path,
    };

    return {
        fields,
        set(extra: Record<string, unknown>): void {
            Object.assign(fields, extra);
            const store = getContext();
            if (store && store !== fields) {
                addContext(extra);
            }
        },
        emit(): void {
            writeCanonicalLine(fields);
        },
    };
}

/**
 * Writes one flat JSON object (no diary `message`/`context` envelope).
 */
function writeCanonicalLine(fields: Record<string, unknown>): void {
    void Bun.write(Bun.stdout, `${JSON.stringify(fields)}\n`);
}

export type { WideEvent, WideEventErrorFields, WideEventHandle, WideEventInit, WideEventOutcome };
export { createWideEvent, wideEvent };
