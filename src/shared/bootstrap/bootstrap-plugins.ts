import fastifyUnderPressure from '@fastify/under-pressure';
import fastifyMetrics from 'fastify-metrics';

import {
  ServiceUnavailableException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import { packageJsonInfo } from '@shared/constants/package-json-info';
import { AllExceptionsFilter } from '@shared/modules/error/exception-filters/all-exceptions/all-exceptions.filter';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { PinoLogger } from '@shared/modules/logger/loggers/pino-logger.service';

export async function bootstrapPlugins(
  app: NestFastifyApplication,
  isDevelopment: boolean,
  openidConnectDomain: string,
): Promise<void> {
  // Enable CORS only for local development, CORS should be enabled in Reverse Proxy instead of the app
  if (isDevelopment) {
    app.enableCors();
  }

  setupVersioning(app);
  setupExceptionFilters(app);
  setupOpenApi(app, openidConnectDomain);
  setupRequestsValidation(app, isDevelopment);
  await setupDdosProtection(app);
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

function setupOpenApi(app: NestFastifyApplication, openidConnectDomain: string): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(packageJsonInfo.name)
    .setDescription(packageJsonInfo.description)
    .setVersion(packageJsonInfo.version)
    .addBearerAuth({
      type: 'openIdConnect',
      openIdConnectUrl: `https://${openidConnectDomain}/.well-known/openid-configuration`,
      'x-tokenName': 'id_token',
    })
    .build();

  const OPEN_API_URL = 'docs';
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: `${OPEN_API_URL}/swagger.json`,
  };

  app.getHttpAdapter().get(`/oauth2-redirect.html`, (req, reply) => {
    reply.redirect(`/${OPEN_API_URL}${req.raw.url}`, 308);
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(OPEN_API_URL, app, document, customOptions);

  app.getHttpAdapter().get(`/${OPEN_API_URL}/errors.json`, () => {
    return appExceptionsRegistry.getRegistryObject();
  });
  app.getHttpAdapter().get(`/${OPEN_API_URL}/errors.html`, (_req, res) => {
    const html = appExceptionsRegistry.getRegistryHtml();

    res.type('text/html').send(html);
  });
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

async function setupDdosProtection(app: NestFastifyApplication): Promise<void> {
  await app.register(fastifyUnderPressure, {
    maxEventLoopDelay: 300,
    maxEventLoopUtilization: 0.98,
    retryAfter: 200,
    exposeStatusRoute: true,
    customError: ServiceUnavailableException,
  });
}

async function setupShutdownHooks(app: NestFastifyApplication): Promise<void> {
  app.enableShutdownHooks();
  // Accessing a pino instance to have access to the 'fatal' log level
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
