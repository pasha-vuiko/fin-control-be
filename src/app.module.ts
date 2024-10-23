import { Module } from '@nestjs/common';

import { AuthModule } from '@shared/modules/auth/auth.module';
import { LogFormat } from '@shared/modules/logger/interfaces/logger-options.interface';
import { LoggerModule } from '@shared/modules/logger/logger.module';
import { LogLevel } from '@shared/modules/logger/types';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { RedisModule } from '@shared/modules/redis/redis.module';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsModule } from '@api/regular-payments/regular-payments.module';

import { config } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const loggerConfig = config.app.logger;

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
      clientId: config.auth.auth0ClientId as string,
      secret: config.auth.auth0ClientSecret as string,
    }),
    RedisModule.forRoot(config.cache.redis),
    LoggerModule.forRoot(loggerConfig.level as LogLevel, {
      ignorePaths: loggerConfig.requestLoggerIgnorePaths,
      logFormat: loggerConfig.prettyPrint ? LogFormat.PRETTY : LogFormat.JSON,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
