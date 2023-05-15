import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Inject,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import { CacheStoreFactory } from '@nestjs/common/cache/interfaces/cache-manager.interface';

import { AppLogger } from '@shared/modules/logger/app-logger';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { REDIS_STORE } from '@shared/modules/redis/providers/redis-store.provider';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static moduleOptions: IRedisModuleOptions;
  private static ioRedisInstance: IoredisWithDefaultTtl;
  private static logger = new AppLogger('RedisConfigService');

  constructor(
    @Inject(REDIS_STORE)
    private redisStore: CacheStoreFactory,
    @Inject(REDIS_MODULE_OPTIONS)
    private moduleOptions: IRedisModuleOptions,
  ) {
    RedisConfigService.moduleOptions = moduleOptions;
  }

  onApplicationShutdown(): void {
    RedisConfigService.getIoRedisInstance().disconnect();
    RedisConfigService.logger.log('Redis is disconnected');
  }

  public createCacheOptions(): CacheModuleOptions {
    return {
      store: this.redisStore,
      redisInstance: RedisConfigService.getIoRedisInstance(),
    };
  }

  public static getIoRedisInstance(): IoredisWithDefaultTtl {
    if (RedisConfigService.ioRedisInstance) {
      return RedisConfigService.ioRedisInstance;
    }

    RedisConfigService.ioRedisInstance = new IoredisWithDefaultTtl(this.moduleOptions);

    this.listenToRedisError(RedisConfigService.ioRedisInstance);

    return RedisConfigService.ioRedisInstance;
  }

  private static listenToRedisError(redisClient: IoredisWithDefaultTtl): void {
    redisClient.on('error', err => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }
}
