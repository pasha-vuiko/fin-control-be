import { Readable } from 'node:stream';

import type { FormData } from 'undici';
import { IncomingHttpHeaders } from 'undici/types/header';

/**
 * Describes options of HTTP request for HttpService
 */
export interface HttpReqOptions extends Omit<RequestInit, 'method' | 'headers' | 'body'> {
  // milliseconds
  timeout?: number;
  body?:
    | string
    | Readable
    | Buffer<ArrayBufferLike>
    | Uint8Array<ArrayBufferLike>
    | FormData
    | null;
  headers?: string[] | IncomingHttpHeaders | null;
  retries?: number;
  retryIntervalMs?: number;
}
