import fastifyMetrics from 'fastify-metrics';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import { packageJsonInfo } from '@shared/constants/package-json-info';
import { AllExceptionsFilter } from '@shared/exception-filters/all-exceptions.filter';
import { PinoLogger } from '@shared/modules/logger/loggers/pino-logger.service';

export async function bootstrapPlugins(
  app: NestFastifyApplication,
  isDevelopment: boolean,
): Promise<void> {
  // Enable CORS only for local development, CORS should be enabled in Reverse Proxy instead of the app
  if (isDevelopment) {
    app.enableCors();
  }

  setupVersioning(app);
  setupExceptionFilters(app);
  setupOpenApi(app);
  setupRequestsValidation(app, isDevelopment);
  await setupShutdownHooks(app);
  await setupMetrics(app);
}

function setupExceptionFilters(app: NestFastifyApplication): void {
  app.useGlobalFilters(new AllExceptionsFilter());
}

function setupRequestsValidation(
  app: NestFastifyApplication,
  isDevelopment: boolean,
): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      enableDebugMessages: isDevelopment,
      disableErrorMessages: !isDevelopment,
    }),
  );
}

function setupOpenApi(app: NestFastifyApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(packageJsonInfo.name)
    .setDescription(packageJsonInfo.description)
    .setVersion(packageJsonInfo.version)
    .addBearerAuth()
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, customOptions);
}

async function setupMetrics(app: NestFastifyApplication): Promise<void> {
  await app.register(fastifyMetrics, {
    endpoint: '/metrics',
    defaultMetrics: {
      enabled: true,
    },
  });
}

function setupVersioning(app: NestFastifyApplication): void {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}

async function setupShutdownHooks(app: NestFastifyApplication): Promise<void> {
  app.enableShutdownHooks();
  // Accessing pino instance to have access to 'fatal' log level
  const pinoLogger = app
    .get(PinoLogger)
    .getInternalLogger()
    .child({ context: 'ShutdownHooks' });

  process.on('unhandledRejection', (reason): void => {
    pinoLogger.fatal(reason, 'Unhandled Rejection');

    process.exit(1);
  });

  process.on('uncaughtException', (err): void => {
    pinoLogger.fatal(err, 'Unhandled Exception');

    process.exit(1);
  });

  process.on('warning', (err): void => {
    pinoLogger.error(err, 'Warning detected');
  });

  process.on('exit', (code): void => {
    if (code === 0) {
      pinoLogger.info('Stopped gracefully');
      return;
    }

    pinoLogger.fatal(`Stopped with code ${code}`);
  });
}
