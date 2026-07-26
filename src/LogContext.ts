/**
 * Global contextual storage using AsyncLocalStorage to inject metadata into logs.
 *
 * @packageDocumentation
 */

import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<Record<string, unknown>>();

/**
 * Runs a function within a specific logging context.
 *
 * @param context - The initial context to apply
 * @param callback - The function to run
 * @returns The result of the callback
 */
function runWithContext<R>(context: Record<string, unknown>, callback: () => R): R {
    return storage.run(context, callback);
}

/**
 * Retrieves the current logging context, if any.
 *
 * @returns The current context or undefined
 */
function getContext(): Record<string, unknown> | undefined {
    return storage.getStore();
}

/**
 * Adds data to the current logging context.
 * Useful for enriching logs mid-request.
 *
 * @param context - Additional data to merge
 */
function addContext(context: Record<string, unknown>): void {
    const store = storage.getStore();
    if (store) {
        Object.assign(store, context);
    }
}

export { addContext, getContext, runWithContext };
