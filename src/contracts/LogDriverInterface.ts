/**
 * Defines the contract for a logging driver.
 *
 * @packageDocumentation
 */

import type { LogLevel } from "./LogLevel";

/**
 * Interface that all log drivers must implement to physically write logs.
 */
interface LogDriverInterface {
    /**
     * Writes a log entry to the driver's output destination.
     *
     * @param level - The log level of the entry
     * @param message - The primary message to format and write
     * @param context - Additional contextual information
     */
    write(level: LogLevel, message: string | Error, context?: Record<string, unknown>): void;
}

export type { LogDriverInterface };
