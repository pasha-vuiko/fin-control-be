import { LoggerModule } from 'nestjs-pino';

import { DynamicModule, Module } from '@nestjs/common';

import { LogLevel } from '@shared/modules/logger/types';
import { getLoggerConfig } from '@shared/modules/logger/utils/get-logger-config.util';

@Module({})
export class AppLoggerModule {
  static forRoot(loggerLevel: LogLevel): DynamicModule {
    const loggerConfig = getLoggerConfig(loggerLevel);

    return {
      module: AppLoggerModule,
      imports: [LoggerModule.forRoot(loggerConfig)],
    };
  }
}
