import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';

import { LOGGER_MODULE_OPTIONS } from '@shared/modules/logger/constants/logger-options-provider-token';
import { LoggerOptions } from '@shared/modules/logger/interfaces/logger-options.interface';
import { InternalPinoLogger } from '@shared/modules/logger/loggers/internal-pino-logger.service';
import { PinoLogger } from '@shared/modules/logger/loggers/pino-logger.service';
import { LoggerConfigService } from '@shared/modules/logger/services/logger-config.service';
import { LogLevel } from '@shared/modules/logger/types';
import { getDefaultLoggerConfig } from '@shared/modules/logger/utils/get-logger-config.util';

@Module({})
export class LoggerModule {
  static forRoot(loggerLevel: LogLevel, options?: LoggerOptions): DynamicModule {
    const optionsWithDefault = this.getOptsMergedWithDefault(loggerLevel, options);

    const paramsProvider: Provider<LoggerOptions> = {
      provide: LOGGER_MODULE_OPTIONS,
      useValue: optionsWithDefault,
    };

    return {
      module: LoggerModule,
      providers: [PinoLogger, InternalPinoLogger, paramsProvider, LoggerConfigService],
      exports: [PinoLogger, InternalPinoLogger, paramsProvider],
    };
  }

  private static getOptsMergedWithDefault(
    loggerLevel: LogLevel,
    options?: LoggerOptions,
  ): LoggerOptions {
    const defaultOptions = getDefaultLoggerConfig(loggerLevel, options?.logFormat);

    if (options) {
      return {
        ...defaultOptions,
        ...options,
      };
    }

    return defaultOptions;
  }
}
