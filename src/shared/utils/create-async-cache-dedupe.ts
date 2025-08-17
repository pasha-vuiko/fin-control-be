import crypto from 'node:crypto';

import { createCache } from 'async-cache-dedupe';

const cache = createCache({
  ttl: 0,
});

export function createAsyncCacheDedupe<T, F extends (arg: any) => Promise<T>>(
  asyncFn: F,
): (...args: Parameters<F>) => Promise<T> {
  const randomStr = crypto.randomBytes(6).toString('hex');
  const cacheFuncName = asyncFn.name ? asyncFn.name : randomStr;

  const cacheInstance = cache.define(cacheFuncName, asyncFn);

  // always defined as we define it above
  // eslint-disable-next-line security/detect-object-injection
  return cacheInstance[cacheFuncName]!;
}
