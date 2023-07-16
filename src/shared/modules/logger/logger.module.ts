import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';

import { FASTIFY_LOGGER_PLUGIN_OPTIONS } from '@shared/modules/logger/constants/logger-options-provider-token';
import { IFastifyLoggerPluginOptions } from '@shared/modules/logger/interfaces/logger-options.interface';
import { InternalPinoLogger } from '@shared/modules/logger/loggers/internal-pino-logger.service';
import { PinoLogger } from '@shared/modules/logger/loggers/pino-logger.service';
import { LoggerConfigService } from '@shared/modules/logger/services/logger-config.service';
import { LogLevel } from '@shared/modules/logger/types';
import { getFastifyLoggerPluginConfig } from '@shared/modules/logger/utils/get-logger-config.util';
import { getPinoLoggerProviders } from '@shared/modules/logger/utils/inject-pino-logger';

@Module({})
export class LoggerModule {
  static forRoot(loggerLevel: LogLevel): DynamicModule {
    const fastifyLoggerPluginOptions = getFastifyLoggerPluginConfig(loggerLevel);

    const paramsProvider: Provider<IFastifyLoggerPluginOptions> = {
      provide: FASTIFY_LOGGER_PLUGIN_OPTIONS,
      useValue: fastifyLoggerPluginOptions || {},
    };

    const decorated = getPinoLoggerProviders();

    return {
      module: LoggerModule,
      providers: [
        PinoLogger,
        ...decorated,
        InternalPinoLogger,
        paramsProvider,
        LoggerConfigService,
      ],
      exports: [PinoLogger, ...decorated, InternalPinoLogger, paramsProvider],
    };
  }
}
