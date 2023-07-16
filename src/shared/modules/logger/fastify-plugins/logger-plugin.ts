import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Logger } from 'pino';

import { IFastifyLoggerPluginOptions } from '@shared/modules/logger/interfaces/logger-options.interface';
import { LogLevel } from '@shared/modules/logger/types';
import {
  LoggerStore,
  loggerAsyncContext,
} from '@shared/modules/logger/utils/logger-async-context';

export interface ILoggerPluginOptions
  extends Omit<IFastifyLoggerPluginOptions, 'pinoOptions'> {
  pinoLogger: Logger;
}

export const loggerPlugin = fastifyPlugin(loggerPluginFn);

async function loggerPluginFn(
  fastify: FastifyInstance,
  options: ILoggerPluginOptions,
): Promise<void> {
  const {
    pinoLogger,
    reqResSerializers,
    customLogLevel = getDefaultResLogLevel,
  } = options;

  const {
    req: reqSerializer = defaultReqSerializer,
    res: resSerializer = defaultResSerializer,
  } = reqResSerializers ?? {};

  fastify.addHook('preHandler', (req, __, next) => {
    const loggerStore = new LoggerStore(req.id, pinoLogger);

    loggerAsyncContext.run(loggerStore, next);
  });

  fastify.addHook('onResponse', (req, res) => {
    const serializedReq = reqSerializer(req);
    const serializedRes = resSerializer(res);
    const responseTime = res.getResponseTime();

    const responseLogLevel = customLogLevel(req, res);

    // eslint-disable-next-line security/detect-object-injection
    pinoLogger[responseLogLevel](
      { req: serializedReq, res: serializedRes, responseTime },
      `request completed`,
    );
  });
}

function defaultReqSerializer(req: FastifyRequest): Record<string, any> {
  return {
    method: req.method,
    url: req.url,
    query: req.query,
    userAgent: req.headers['user-agent'] ?? req.headers['User-Agent'],
  };
}

function defaultResSerializer(res: FastifyReply): Record<string, any> {
  return {
    statusCode: res.statusCode,
  };
}

function getDefaultResLogLevel(_req: FastifyRequest, res: FastifyReply): LogLevel {
  const { statusCode } = res;

  if (statusCode >= 400 && statusCode < 500) {
    return 'warn';
  }

  if (statusCode >= 500) {
    return 'error';
  }

  if (statusCode >= 300 && statusCode < 400) {
    return 'debug';
  }

  return 'debug';
}
