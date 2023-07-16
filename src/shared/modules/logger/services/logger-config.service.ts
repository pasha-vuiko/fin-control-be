import pino from 'pino';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { FASTIFY_LOGGER_PLUGIN_OPTIONS } from '@shared/modules/logger/constants/logger-options-provider-token';
import { loggerPlugin } from '@shared/modules/logger/fastify-plugins/logger-plugin';
import { IFastifyLoggerPluginOptions } from '@shared/modules/logger/interfaces/logger-options.interface';
import { loggerAsyncContext } from '@shared/modules/logger/utils/logger-async-context';

@Injectable()
export class LoggerConfigService implements OnModuleInit {
  constructor(
    @Inject(FASTIFY_LOGGER_PLUGIN_OPTIONS)
    private loggerModuleOptions: IFastifyLoggerPluginOptions,
    private adapterHost: HttpAdapterHost<FastifyAdapter>,
  ) {}

  async onModuleInit(): Promise<void> {
    const pinoLogger = this.getPinoLogger();

    //@ts-expect-error type of the plugin is not compatible with the type of the register method
    await this.adapterHost.httpAdapter.register(loggerPlugin, { pinoLogger });
  }

  private getPinoLogger(): pino.Logger {
    const pinoOptions = {
      ...(this.loggerModuleOptions.pinoOptions
        ? this.loggerModuleOptions.pinoOptions
        : {}),
      mixin() {
        return {
          reqId: loggerAsyncContext.getStore()?.reqId,
        };
      },
    };

    if (this.loggerModuleOptions.stream) {
      return pino(pinoOptions, this.loggerModuleOptions.stream);
    }

    return pino(pinoOptions);
  }
}
