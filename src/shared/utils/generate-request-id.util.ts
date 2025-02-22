import crypto from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import { REQUEST_ID_HEADER } from '@shared/modules/logger/constants/request-id-header';

export function generateRequestId(req: IncomingMessage): string {
  // eslint-disable-next-line security/detect-object-injection
  const existingTraceId = req.headers[REQUEST_ID_HEADER];

  if (existingTraceId) {
    return existingTraceId as string;
  }

  return crypto.randomUUID();
}
