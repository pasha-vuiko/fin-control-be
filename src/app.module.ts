import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLoggerModule } from '@shared/modules/logger/app-logger.module';
import { AuthModule } from '@shared/modules/auth/auth.module';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { RedisModule } from '@shared/modules/redis/redis.module';
import { config } from './app.config';
import { LogLevel } from '@shared/modules/logger/types';

@Module({
  imports: [
    //shared
    AuthModule,
    PrismaModule,
    RedisModule,
    AppLoggerModule.forRoot(config.app.logger.level as LogLevel),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
