import { FastifyReply, FastifyRequest } from 'fastify';
import pino, { LevelWithSilent } from 'pino';

import { IFastifyLoggerPluginOptions } from '@shared/modules/logger/interfaces/logger-options.interface';
import { ISerializedRequest } from '@shared/modules/logger/interfaces/serialized-request.interface';
import pinoPrettyTransport from '@shared/modules/logger/utils/pino-pretty-transport';

export function getFastifyLoggerPluginConfig(
  level: LevelWithSilent,
): IFastifyLoggerPluginOptions {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isPretty = process.env.LOG_FORMAT === 'pretty';

  return {
    pinoOptions: {
      level: level,
    },
    stream: isPretty ? pinoPrettyTransport() : pino.destination({ sync: false }),
    customLogLevel: function (_req, res): LevelWithSilent {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      }

      if (res.statusCode >= 500) {
        return 'error';
      }

      if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'debug';
      }

      return isDevelopment ? 'debug' : 'silent';
    },
    reqResSerializers: {
      req: req => serializeReq(req),
      res: reply => serializeRes(reply),
    },
  };
}

function serializeReq(req: FastifyRequest): ISerializedRequest {
  return {
    id: req.id,
    method: req.method,
    url: req.url,
    query: req.query,
    userAgent: req.headers['user-agent'] ?? req.headers['User-Agent'],
  };
}

function serializeRes(res: FastifyReply): any {
  return {
    statusCode: res.statusCode,
  };
}
