import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';

import { JsonCacheInterceptor } from '@shared/modules/redis/interceptors/json-cache/json-cache.interceptor';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { redisModuleOptionsProvider } from '@shared/modules/redis/providers/redis-module-options.provider';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { RedisService } from '@shared/modules/redis/services/redis/redis.service';

@Module({
  exports: [CacheModule, RedisService, RedisConfigService],
})
export class RedisModule {
  static forRoot(opts: IRedisModuleOptions = {}): DynamicModule {
    const filteredOptions = filterModuleOptions(opts);
    const moduleOptionsProvider = redisModuleOptionsProvider(filteredOptions);

    return {
      global: true,
      module: RedisModule,
      imports: [
        CacheModule.registerAsync({
          useClass: RedisConfigService,
          extraProviders: [moduleOptionsProvider],
        }),
      ],
      providers: [
        moduleOptionsProvider,
        RedisService,
        RedisConfigService,
        JsonCacheInterceptor,
      ],
      exports: [moduleOptionsProvider],
    };
  }
}

function filterModuleOptions(options: IRedisModuleOptions): IRedisModuleOptions {
  const resultConfig = {};

  for (const key of Object.getOwnPropertyNames(options)) {
    // @ts-expect-error - we are sure that key exists in options
    // eslint-disable-next-line security/detect-object-injection
    if (options[key] !== undefined) {
      // @ts-expect-error - we are sure that key exists in options
      // eslint-disable-next-line security/detect-object-injection
      resultConfig[key] = options[key];
    }
  }

  return resultConfig;
}
