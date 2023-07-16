import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { PinoLogger } from '@shared/modules/logger/loggers/pino-logger.service';

export function bootstrapLogger(app: NestFastifyApplication): PinoLogger {
  const logger = app.get(PinoLogger);
  app.useLogger(logger);

  return logger;
}
