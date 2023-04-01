import { FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '@shared/modules/logger/constants/request-id-header';

export function generateRequestId(req: FastifyRequest): string {
  // eslint-disable-next-line security/detect-object-injection
  const existingTraceId = req.headers[REQUEST_ID_HEADER];

  if (existingTraceId) {
    return existingTraceId as string;
  }

  return randomUUID();
}
