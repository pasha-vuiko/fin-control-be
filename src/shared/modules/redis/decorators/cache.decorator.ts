import { applyDecorators, CacheTTL, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 *
 * @param ttl Cache TTL
 * @description Caches response of GET endpoint, may be used for endpoints that return
 * both JSON and plain text
 */
export function Cache(ttl?: string | number): MethodDecorator {
  if (!ttl) {
    return UseInterceptors(CacheInterceptor);
  }

  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(Number(ttl)));
}
