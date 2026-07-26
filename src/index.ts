/**
 * Main entry point for @ninots/logger.
 *
 * @packageDocumentation
 */

export type { LogDriverInterface } from "./contracts/LogDriverInterface";
export type { LoggerInterface } from "./contracts/LoggerInterface";
export type { LogLevel } from "./contracts/LogLevel";
export { addContext, getContext, runWithContext } from "./LogContext";
export { LoggerManager } from "./LoggerManager";
export { StdoutJsonDriver } from "./StdoutJsonDriver";
export type {
    WideEvent,
    WideEventErrorFields,
    WideEventHandle,
    WideEventInit,
    WideEventOutcome,
} from "./WideEvent";
export { createWideEvent, wideEvent } from "./WideEvent";
