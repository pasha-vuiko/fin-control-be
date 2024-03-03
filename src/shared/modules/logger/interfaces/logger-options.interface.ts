import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DestinationStream,
  LevelWithSilent,
  LoggerOptions as PinoLoggerOptions,
} from 'pino';

export interface ILoggerOptions {
  pinoOptions?: PinoLoggerOptions;

  stream?: DestinationStream;

  renameContext?: string;

  customLogLevel?: (req: FastifyRequest, res: FastifyReply) => LevelWithSilent;

  ignorePaths?: string[];

  reqResSerializers?: {
    req: (req: FastifyRequest) => Record<string, any>;
    res: (res: FastifyReply) => Record<string, any>;
  };
}
