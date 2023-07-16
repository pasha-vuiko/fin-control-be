import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrapLogger } from '@shared/bootstrap/bootstrap-logger';
import { bootstrapPlugins } from '@shared/bootstrap/bootstrap-plugins';

import { config } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    //@ts-expect-error config is not compatible
    new FastifyAdapter(config.app.fastify),
    { bufferLogs: true },
  );

  const logger = bootstrapLogger(app);
  await bootstrapPlugins(app, config.app.isDevelopment);

  await app.listen(config.app.port as string, '0.0.0.0');
  logger.log(`App is running on: ${await app.getUrl()}`, 'main.ts');

  return app;
}

bootstrap();
