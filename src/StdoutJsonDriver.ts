/**
 * Implements a driver that outputs structured JSON logs to standard output.
 *
 * @packageDocumentation
 */

import type { LogDriverInterface } from "./contracts/LogDriverInterface";
import type { LogLevel } from "./contracts/LogLevel";

/**
 * Driver that writes highly performant JSON payloads directly to standard out.
 */
class StdoutJsonDriver implements LogDriverInterface {
    write(level: LogLevel, message: string | Error, context?: Record<string, unknown>): void {
        const payload: Record<string, unknown> = {
            level,
            timestamp: new Date().toISOString(),
        };

        if (message instanceof Error) {
            payload.message = message.message;
            payload.err = {
                message: message.message,
                name: message.name,
                stack: message.stack,
            };
        } else {
            payload.message = message;
        }

        if (context) {
            payload.context = context;
        }

        // High performance native async write without blocking the main event loop
        void Bun.write(Bun.stdout, `${JSON.stringify(payload)}\n`);
    }
}

export { StdoutJsonDriver };
