import { DynamicModule, Module } from '@nestjs/common';

import { getDrizzleClientProvider } from '@shared/modules/drizzle/providers/drizzle-client.provider';

@Module({})
export class DrizzleModule {
  static forRoot(drizzleSchema: any, dbUrl = process.env.DATABASE_URL): DynamicModule {
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not provided');
    }

    const drizzleClientProvider = getDrizzleClientProvider(dbUrl, drizzleSchema);

    return {
      global: true,
      module: DrizzleModule,
      providers: [drizzleClientProvider],
      exports: [drizzleClientProvider],
    };
  }
}
