import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { Provider } from '@nestjs/common';

import { Logger } from '@shared/modules/logger/loggers/logger';

export const DRIZZLE_CLIENT = Symbol('DRIZZLE_CLIENT');

export function getDrizzleClientProvider<T extends Record<string, unknown>>(
  dbUrl: string,
  drizzleSchema: T,
): Provider<PostgresJsDatabase<T>> {
  return {
    provide: DRIZZLE_CLIENT,
    useFactory: async (): Promise<PostgresJsDatabase<any>> => {
      const queryClient = postgres(dbUrl);
      const logger = new Logger('DrizzleClient');

      return drizzle(queryClient, {
        schema: drizzleSchema,
        logger: {
          logQuery(query: string, params: unknown[]) {
            logger.verbose({ query, params });
          },
        },
      });
    },
  };
}
