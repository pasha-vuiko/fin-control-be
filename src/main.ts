import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { bootstrapLogger } from '@shared/bootstrap/bootstrap-logger';
import {
  setupDdosProtection,
  setupExceptionFilters,
  setupMetrics,
  setupOpenApi,
  setupRequestsValidation,
  setupShutdownHooks,
  setupVersioning,
} from '@shared/bootstrap/bootstrap-plugins';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';

import { config } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<NestFastifyApplication> {
  const fastifyConfig = await config.app.fastify.getConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyConfig),
    { bufferLogs: true },
  );

  // Enable CORS only for local development, CORS should be enabled in Reverse Proxy instead of the app
  if (config.app.isDevelopment) {
    app.enableCors();
  }

  const extraOpenApiModels = [PagePaginationResEntity];

  setupVersioning(app);
  setupExceptionFilters(app);
  setupOpenApi(app, config.auth.auth0Domain, extraOpenApiModels);
  setupRequestsValidation(app, config.app.isDevelopment);
  await setupDdosProtection(app);
  await setupShutdownHooks(app);
  await setupMetrics(app);

  const logger = bootstrapLogger(app);

  await app.listen({
    port: Number(config.app.port),
    host: '0.0.0.0',
  });
  const appUrl = (await app.getUrl()).replace('127.0.0.1', 'localhost');

  logger.log(`App is running on: ${appUrl}`, 'main.ts');

  return app;
}

void bootstrap();
