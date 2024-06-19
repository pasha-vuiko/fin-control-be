import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrapLogger } from '@shared/bootstrap/bootstrap-logger';
import { bootstrapPlugins } from '@shared/bootstrap/bootstrap-plugins';

import { config } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<NestFastifyApplication> {
  const fastifyConfig = await config.app.fastify.getConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    //@ts-expect-error incompatible types
    new FastifyAdapter(fastifyConfig),
    { bufferLogs: true },
  );

  await bootstrapPlugins(app, config.app.isDevelopment, config.auth.auth0Domain);
  const logger = bootstrapLogger(app);

  await app.listen(config.app.port as string, '0.0.0.0');
  const appUrl = (await app.getUrl()).replace('127.0.0.1', 'localhost');

  logger.log(`App is running on: ${appUrl}`, 'main.ts');

  return app;
}

void bootstrap();
