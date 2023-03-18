import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import authenticate from '../fastify-plugins/authenticate.plugin';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { config } from '../../app.config';
import { AllExceptionsFilter } from '@shared/exception-filters/all-exceptions.filter';
import { packageJsonInfo } from '@shared/constants/package-json-info';

export async function bootstrapPlugins(app: NestFastifyApplication): Promise<void> {
  if (config.app.isDevelopment) {
    app.enableCors();
  }

  await registerPlugins(app);
  setupExceptionFilters(app);
  setupOpenApi(app);
  setupRequestsValidation(app);
  await setupShutdownHooks(app);
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

async function setupShutdownHooks(app: NestFastifyApplication): Promise<void> {
  app.enableShutdownHooks();
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
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
