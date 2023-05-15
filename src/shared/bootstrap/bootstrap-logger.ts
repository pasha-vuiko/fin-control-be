import { Logger } from 'nestjs-pino';

import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function bootstrapLogger(app: NestFastifyApplication): Logger {
  const logger = app.get(Logger);
  app.useLogger(logger);

  return logger;
}
