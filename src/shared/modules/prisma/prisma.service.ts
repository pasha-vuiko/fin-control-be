import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import { Pool } from 'pg';

import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

import { Logger } from '@shared/modules/logger/loggers/logger';
import { PRISMA_MODULE_OPTIONS } from '@shared/modules/prisma/constants/prisma-module-options-injection-token';
import { TPrismaOptions } from '@shared/modules/prisma/types/prisma-options.type';

@Injectable()
export class PrismaService<
    DrizzleSchema extends Record<string, unknown> = Record<string, never>,
  >
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pgPool: Pool;
  public readonly $drizzle: NodePgDatabase<DrizzleSchema>;

  constructor(@Inject(PRISMA_MODULE_OPTIONS) options: TPrismaOptions) {
    const connectionString = `${process.env.DATABASE_URL}`;

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      ...options,
      adapter,
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });

    this.pgPool = pool;
    this.$drizzle = pgDrizzle({
      client: pool,
    });

    // @ts-expect-error wrong typing
    this.$on<'query'>('query', event => {
      this.logger.verbose(event.query);
      this.logger.verbose(`Query duration: ${event.duration} ms`);
    });
  }

  onModuleInit(): void {
    this.$connect()
      .then(() => this.logger.log('Successfully connected to the main DB'))
      .catch((e: Error | any) =>
        this.logger.error(
          'Failed to connect to the DB, the connection retry will be done on the first request to the DB',
          e,
        ),
      );
  }

  getDrizzleWithSchema<Schema extends Record<string, unknown>>(
    schema: Schema,
  ): NodePgDatabase<Schema> {
    return pgDrizzle({
      client: this.pgPool,
      schema,
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Successfully disconnected from the main DB');
  }
}
