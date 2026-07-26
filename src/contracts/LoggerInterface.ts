/**
 * Provides the core interface for any logger implementation within the framework.
 *
 * @packageDocumentation
 */

import type { LogLevel } from "./LogLevel";

/**
 * Interface that all loggers must implement.
 */
interface LoggerInterface {
    /**
     * Log a message at the specified level.
     *
     * @param level - The severity level
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    log(level: LogLevel, message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log a trace message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    trace(message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log a debug message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    debug(message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log an info message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    info(message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log a warning message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    warn(message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log an error message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    error(message: string | Error, context?: Record<string, unknown>): void;

    /**
     * Log a fatal message.
     *
     * @param message - The message or error to log
     * @param context - Optional contextual data
     */
    fatal(message: string | Error, context?: Record<string, unknown>): void;
}

export type { LoggerInterface };
