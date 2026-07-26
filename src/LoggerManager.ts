/**
 * Implements the main logging manager that delegates to drivers.
 *
 * @packageDocumentation
 */

import type { LogDriverInterface } from "./contracts/LogDriverInterface";
import type { LoggerInterface } from "./contracts/LoggerInterface";
import type { LogLevel } from "./contracts/LogLevel";
import { getContext } from "./LogContext";

/**
 * Manages logging by delegating to an underlying driver.
 */
class LoggerManager implements LoggerInterface {
    readonly #driver: LogDriverInterface;

    /**
     * Initializes the manager with a specific log driver.
     *
     * @param driver - The destination driver for log entries
     */
    constructor(driver: LogDriverInterface) {
        this.#driver = driver;
    }

    log(level: LogLevel, message: string | Error, context?: Record<string, unknown>): void {
        const globalContext = getContext();
        const mergedContext = globalContext || context ? { ...globalContext, ...context } : undefined;

        this.#driver.write(level, message, mergedContext);
    }

    trace(message: string | Error, context?: Record<string, unknown>): void {
        this.log("trace", message, context);
    }

    debug(message: string | Error, context?: Record<string, unknown>): void {
        this.log("debug", message, context);
    }

    info(message: string | Error, context?: Record<string, unknown>): void {
        this.log("info", message, context);
    }

    warn(message: string | Error, context?: Record<string, unknown>): void {
        this.log("warn", message, context);
    }

    error(message: string | Error, context?: Record<string, unknown>): void {
        this.log("error", message, context);
    }

    fatal(message: string | Error, context?: Record<string, unknown>): void {
        this.log("fatal", message, context);
    }
}

export { LoggerManager };
