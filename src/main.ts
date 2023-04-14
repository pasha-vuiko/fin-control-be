import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { config } from './app.config';
import { bootstrapPlugins } from '@shared/bootstrap/bootstrap-plugins';
import { bootstrapLogger } from '@shared/bootstrap/bootstrap-logger';

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(config.app.fastify),
    { bufferLogs: true },
  );

  const logger = bootstrapLogger(app);
  await bootstrapPlugins(app, logger, config.app.isDevelopment);

  await app.listen(config.app.port as string, '0.0.0.0');
  logger.log(`App is running on: ${await app.getUrl()}`, 'main.ts');

  return app;
}

bootstrap();
