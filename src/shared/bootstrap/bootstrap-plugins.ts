import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import authenticate from '../fastify-plugins/authenticate.plugin';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { config } from '../../app.config';
import { AllExceptionsFilter } from '@shared/exception-filters/all-exceptions.filter';
import { packageJsonInfo } from '@shared/constants/package-json-info';
import { Logger } from 'nestjs-pino';

export async function bootstrapPlugins(
  app: NestFastifyApplication,
  logger: Logger,
): Promise<void> {
  // Enable CORS only for local development, CORS should be enabled in Reverse Proxy instead of the app
  if (config.app.isDevelopment) {
    app.enableCors();
  }

  await registerPlugins(app);
  setupExceptionFilters(app);
  setupOpenApi(app);
  setupRequestsValidation(app);
  await setupShutdownHooks(app, logger);
}

async function registerPlugins(app: NestFastifyApplication): Promise<void> {
  const { auth0Domain, auth0ClientSecret } = config.auth;

  await app.register(authenticate, {
    domain: auth0Domain as string,
    secret: auth0ClientSecret as string,
  });
}

function setupExceptionFilters(app: NestFastifyApplication): void {
  app.useGlobalFilters(new AllExceptionsFilter());
}

function setupRequestsValidation(app: NestFastifyApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      enableDebugMessages: config.app.isDevelopment,
    }),
  );
}

async function setupShutdownHooks(
  app: NestFastifyApplication,
  logger: Logger,
): Promise<void> {
  app.enableShutdownHooks();
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Accessing pino instance to have access to 'fatal' log level
  // @ts-expect-error access to protected field
  const pinoLogger = logger.logger;

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
    } else {
      pinoLogger.fatal(`Stopped with code ${code}`);
    }
  });
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

  SwaggerModule.setup('api', app, document, customOptions);
}
