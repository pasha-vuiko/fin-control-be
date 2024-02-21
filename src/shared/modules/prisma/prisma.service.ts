import { PrismaClient } from '@prisma/client';

import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

import { Logger } from '@shared/modules/logger/loggers/logger';
import { PRISMA_MODULE_OPTIONS } from '@shared/modules/prisma/constants/prisma-module-options-injection-token';
import { TPrismaOptions } from '@shared/modules/prisma/types/prisma-options.type';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(PRISMA_MODULE_OPTIONS) options: TPrismaOptions) {
    super(options);
  }

  onModuleInit(): void {
    this.$connect()
      .then(() => this.logger.log('Successfully connected to the DB'))
      .catch((e: Error | any) =>
        this.logger.error(
          'Failed to connect to the DB, the connection retry will be done on the first request to the DB',
          e,
        ),
      );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Successfully disconnected from the DB');
  }
}
