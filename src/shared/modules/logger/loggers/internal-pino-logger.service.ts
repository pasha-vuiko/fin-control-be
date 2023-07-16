import pino from 'pino';

import { Inject, Injectable, Scope } from '@nestjs/common';

import { FASTIFY_LOGGER_PLUGIN_OPTIONS } from '@shared/modules/logger/constants/logger-options-provider-token';
import { IFastifyLoggerPluginOptions } from '@shared/modules/logger/interfaces/logger-options.interface';

import { loggerAsyncContext } from '../utils/logger-async-context';

type PinoMethods = Pick<
  pino.Logger,
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
>;

/**
 * This is copy of pino.LogFn but with possibilty to make method override.
 * Current usage works:
 *
 *  trace(msg: string, ...args: any[]): void;
 *  trace(obj: object, msg?: string, ...args: any[]): void;
 *  trace(...args: Parameters<LoggerFn>) {
 *    this.call('trace', ...args);
 *  }
 *
 * But if change local LoggerFn to pino.LogFn – this will say that overrides
 * are incompatible
 */
type LoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void);

let outOfContext: pino.Logger | undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class InternalPinoLogger implements PinoMethods {
  protected context = '';
  protected readonly contextName: string;

  constructor(
    @Inject(FASTIFY_LOGGER_PLUGIN_OPTIONS)
    { pinoOptions, stream, renameContext }: IFastifyLoggerPluginOptions,
  ) {
    if (!outOfContext) {
      if (stream && pinoOptions) {
        outOfContext = pino(pinoOptions, stream);
      } else {
        outOfContext = pino(pinoOptions);
      }
    }

    this.contextName = renameContext || 'context';
  }

  trace(msg: string, ...args: any[]): void;
  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(...args: Parameters<LoggerFn>) {
    this.call('trace', ...args);
  }

  debug(msg: string, ...args: any[]): void;
  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(...args: Parameters<LoggerFn>) {
    this.call('debug', ...args);
  }

  info(msg: string, ...args: any[]): void;
  info(obj: unknown, msg?: string, ...args: any[]): void;
  info(...args: Parameters<LoggerFn>) {
    this.call('info', ...args);
  }

  warn(msg: string, ...args: any[]): void;
  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(...args: Parameters<LoggerFn>) {
    this.call('warn', ...args);
  }

  error(msg: string, ...args: any[]): void;
  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(...args: Parameters<LoggerFn>) {
    this.call('error', ...args);
  }

  fatal(msg: string, ...args: any[]): void;
  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(...args: Parameters<LoggerFn>) {
    this.call('fatal', ...args);
  }

  setContext(value: string) {
    this.context = value;
  }

  protected call(method: pino.Level, ...args: Parameters<LoggerFn>) {
    // @ts-expect-error args are union of tuple types
    this.logger[method](...args);
  }

  public get logger(): pino.Logger {
    // outOfContext is always set in runtime before starts using
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const store = loggerAsyncContext.getStore();

    if (!store) {
      // @ts-expect-error logger is not defined
      return outOfContext;
    }

    return store.pinoLogger;
  }

  public assign(fields: pino.Bindings) {
    const store = loggerAsyncContext.getStore();
    if (!store) {
      throw new Error(
        `${InternalPinoLogger.name}: unable to assign extra fields out of request scope`,
      );
    }
    store.pinoLogger = store.pinoLogger.child(fields);
  }
}