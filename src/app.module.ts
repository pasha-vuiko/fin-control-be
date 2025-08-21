import { Module } from '@nestjs/common';

import { AuthModule } from '@shared/modules/auth/auth.module';
import { DKronModule } from '@shared/modules/d-kron/d-kron.module';
import { LogFormat } from '@shared/modules/logger/interfaces/logger-options.interface';
import { LoggerModule } from '@shared/modules/logger/logger.module';
import { LogLevel } from '@shared/modules/logger/types';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { RedisModule } from '@shared/modules/redis/redis.module';

import { CustomersModule } from '@api/domain/customers/customers.module';
import { ExpensesModule } from '@api/domain/expenses/expenses.module';
import { RegularPaymentsModule } from '@api/domain/regular-payments/regular-payments.module';
import { JobsModule } from '@api/shared/jobs/jobs.module';

import { config } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const loggerConfig = config.app.logger;

@Module({
  imports: [
    // domain API modules
    CustomersModule,
    ExpensesModule,
    RegularPaymentsModule,
    // shared API modules
    JobsModule,

    // shared modules
    PrismaModule.forRoot({
      errorFormat: config.app.isDevelopment ? 'pretty' : 'minimal',
    }),
    AuthModule.forRoot({
      domain: config.auth.auth0Domain,
      clientId: config.auth.auth0ClientId as string,
      secret: config.auth.auth0ClientSecret as string,
    }),
    RedisModule.forRoot(config.cache.redis),
    LoggerModule.forRoot(loggerConfig.level as LogLevel, {
      ignorePaths: loggerConfig.requestLoggerIgnorePaths,
      logFormat: loggerConfig.prettyPrint ? LogFormat.PRETTY : LogFormat.JSON,
    }),
    DKronModule.forRoot({
      dKronUrl: config.jobScheduler.dkron.url,
      executeJobEndpoint: `${config.app.baseUrl}/v1/jobs/execute`,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
