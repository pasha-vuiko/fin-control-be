import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LoggerService } from '@nestjs/common/services/logger.service';
import { Logger } from 'nestjs-pino';

export function bootstrapLogger(app: NestFastifyApplication): LoggerService {
  const logger = app.get(Logger);
  app.useLogger(logger);

  return logger;
}
