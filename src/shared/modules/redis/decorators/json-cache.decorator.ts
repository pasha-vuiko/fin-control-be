import { CacheTTL, UseInterceptors, applyDecorators } from '@nestjs/common';

import { JsonCacheInterceptor } from '@shared/modules/redis/interceptors/json-cache.interceptor';

/**
 *
 * @param ttl Cache TTL
 * @description Caches response of GET endpoint, may be used for endpoints that return
 * JSON only, as it always adds "content-type: application/json" header to the cached response
 */
export function JsonCache(ttl?: string | number): MethodDecorator {
  if (!ttl) {
    return UseInterceptors(JsonCacheInterceptor);
  }

  return applyDecorators(UseInterceptors(JsonCacheInterceptor), CacheTTL(Number(ttl)));
}
