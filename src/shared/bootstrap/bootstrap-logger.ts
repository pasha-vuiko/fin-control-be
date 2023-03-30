import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

export function bootstrapLogger(app: NestFastifyApplication): Logger {
  const logger = app.get(Logger);
  app.useLogger(logger);

  return logger;
}
