import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import authenticate from '../fastify-plugins/authenticate.plugin';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { config } from '../../app.config';
import { AllExceptionsFilter } from '@shared/exception-filters/all-exceptions.filter';
import { packageJsonInfo } from '@shared/constants/package-json-info';

export async function bootstrapPlugins(app: NestFastifyApplication): Promise<void> {
  await app.register(authenticate);

  app.useGlobalFilters(new AllExceptionsFilter());

  setupOpenApi(app);
  setupRequestsValidation(app);
  await setupShutdownHooks(app);
}

function setupRequestsValidation(app: NestFastifyApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
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
    .setTitle('Test shop API')
    .setDescription('The shop API description')
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
