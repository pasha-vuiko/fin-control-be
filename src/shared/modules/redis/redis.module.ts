import { CacheModule, DynamicModule, Module } from '@nestjs/common';

import { RedisCacheService } from '@shared/modules/redis/services/redis-cache/redis-cache.service';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { redisStoreProvider } from '@shared/modules/redis/providers/redis-store.provider';
import { JsonCacheInterceptor } from '@shared/modules/redis/interceptors/json-cache.interceptor';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { redisModuleOptionsProvider } from '@shared/modules/redis/providers/redis-module-options.provider';

@Module({
  exports: [CacheModule, RedisCacheService, RedisConfigService],
})
export class RedisModule {
  static forRoot(opts: IRedisModuleOptions = {}): DynamicModule {
    const filteredOptions = filterModuleOptions(opts);

    return {
      module: RedisModule,
      imports: [
        CacheModule.registerAsync({
          useClass: RedisConfigService,
          extraProviders: [
            redisStoreProvider,
            redisModuleOptionsProvider(filteredOptions),
          ],
        }),
      ],
      providers: [
        redisStoreProvider,
        redisModuleOptionsProvider(opts),
        RedisCacheService,
        RedisConfigService,
        JsonCacheInterceptor,
      ],
    };
  }
}

function filterModuleOptions(options: IRedisModuleOptions): IRedisModuleOptions {
  const resultConfig = {};

  for (const key in options) {
    // @ts-expect-error - we are sure that key exists in options
    // eslint-disable-next-line security/detect-object-injection
    if (options[key]) {
      // @ts-expect-error - we are sure that key exists in options
      // eslint-disable-next-line security/detect-object-injection
      resultConfig[key] = options[key];
    }
  }

  return resultConfig;
}
