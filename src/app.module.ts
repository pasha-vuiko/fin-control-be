import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLoggerModule } from '@shared/modules/logger/app-logger.module';
import { AuthModule } from '@shared/modules/auth/auth.module';
import { RedisModule } from '@shared/modules/redis/redis.module';
import { config } from './app.config';
import { LogLevel } from '@shared/modules/logger/types';
import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';

@Module({
  imports: [
    // api
    CustomersModule,
    ExpensesModule,
    // shared
    PrismaModule,
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
