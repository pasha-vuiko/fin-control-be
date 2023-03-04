import { config } from '../../../../app.config';
import {
  applyDecorators,
  CacheInterceptor,
  CacheTTL,
  UseInterceptors,
} from '@nestjs/common';

/**
 *
 * @param ttl Cache TTL
 * @description Caches response of GET endpoint, may be used for endpoints that return
 * both JSON and plain text
 */
export function Cache(
  ttl: string | number | undefined = config.cache.redis.defaultTTL,
): MethodDecorator {
  return applyDecorators(UseInterceptors(CacheInterceptor), CacheTTL(Number(ttl)));
}
