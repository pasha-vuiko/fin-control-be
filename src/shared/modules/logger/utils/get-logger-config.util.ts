import { FastifyReply, FastifyRequest } from 'fastify';
import { Params as PinoParams } from 'nestjs-pino/params';
import pino, { LevelWithSilent } from 'pino';

import { ISerializedRequest } from '@shared/modules/logger/interfaces/serialized-request.interface';
import pinoPrettyTransport from '@shared/modules/logger/utils/pino-pretty-transport';

export function getLoggerConfig(level: LevelWithSilent): PinoParams {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isPretty = process.env.LOG_FORMAT === 'pretty';

  return {
    pinoHttp: {
      level: level,
      stream: isPretty ? pinoPrettyTransport() : pino.destination({ sync: false }),
      quietReqLogger: true,
      customLogLevel: function (_req, res, err): LevelWithSilent {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        }

        if (res.statusCode >= 500 || err) {
          return 'error';
        }

        if (res.statusCode >= 300 && res.statusCode < 400) {
          return 'debug';
        }

        return isDevelopment ? 'debug' : 'silent';
      },
      serializers: {
        req: (req: FastifyRequest): ISerializedRequest => serializeReq(req),
        res: (reply: FastifyReply): any => serializeRes(reply),
      },
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
