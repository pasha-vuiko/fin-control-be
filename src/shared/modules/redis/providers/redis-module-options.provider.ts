import { Provider } from '@nestjs/common';

import { RedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';

export const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');

export function redisModuleOptionsProvider(
  options: RedisModuleOptions,
): Provider<RedisModuleOptions> {
  return {
    provide: REDIS_MODULE_OPTIONS,
    useValue: options,
  };
}
