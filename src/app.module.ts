import { Module } from '@nestjs/common';

import { AuthModule } from '@shared/modules/auth/auth.module';
import { AppLoggerModule } from '@shared/modules/logger/app-logger.module';
import { LogLevel } from '@shared/modules/logger/types';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { RedisModule } from '@shared/modules/redis/redis.module';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsModule } from '@api/regular-payments/regular-payments.module';

import { config } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// TODO Add proper pagination response for all apis
// TODO Split admin and customer permissions APIs
@Module({
  imports: [
    // api
    CustomersModule,
    ExpensesModule,
    RegularPaymentsModule,
    // shared
    PrismaModule.forRoot({
      errorFormat: config.app.isDevelopment ? 'pretty' : 'minimal',
    }),
    AuthModule.forRoot({
      domain: config.auth.auth0Domain as string,
      secret: config.auth.auth0ClientSecret as string,
    }),
    RedisModule.forRoot(config.cache.redis),
    // TODO Fix performance issue
    AppLoggerModule.forRoot(config.app.logger.level as LogLevel),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
