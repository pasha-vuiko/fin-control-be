import { CacheModule, Module } from '@nestjs/common';

import { RedisCacheService } from '@shared/modules/redis/services/redis-cache/redis-cache.service';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { redisStoreProvider } from '@shared/modules/redis/providers/redis-store.provider';
import { JsonCacheInterceptor } from '@shared/modules/redis/interceptors/json-cache.interceptor';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: RedisConfigService,
      extraProviders: [redisStoreProvider],
      isGlobal: true,
    }),
  ],
  providers: [
    redisStoreProvider,
    RedisCacheService,
    RedisConfigService,
    JsonCacheInterceptor,
  ],
  exports: [CacheModule, RedisCacheService, RedisConfigService],
})
export class RedisModule {}
