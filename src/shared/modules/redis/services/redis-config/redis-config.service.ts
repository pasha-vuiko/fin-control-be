import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { CacheStoreFactory } from '@nestjs/common/cache/interfaces/cache-manager.interface';

import { Logger } from '@shared/modules/logger/loggers/logger';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { REDIS_STORE } from '@shared/modules/redis/providers/redis-store.provider';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static moduleOptions: IRedisModuleOptions;
  private static ioRedisInstance: IoredisWithDefaultTtl;
  private static logger = new Logger('RedisConfigService');

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
    RedisConfigService.logger.log('Successfully disconnected from the Redis');
  }

  public createCacheOptions(): CacheModuleOptions {
    return {
      store: this.redisStore,
      redisInstance: RedisConfigService.getIoRedisInstance(),
    };
  }

  public static getIoRedisInstance(): IoredisWithDefaultTtl {
    if (this.ioRedisInstance) {
      return this.ioRedisInstance;
    }

    this.ioRedisInstance = new IoredisWithDefaultTtl(this.moduleOptions);

    this.listenToRedisConnection(this.ioRedisInstance);
    this.listenToRedisError(this.ioRedisInstance);

    return this.ioRedisInstance;
  }

  private static listenToRedisError(redisClient: IoredisWithDefaultTtl): void {
    redisClient.on('error', err => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  private static listenToRedisConnection(redisClient: IoredisWithDefaultTtl): void {
    redisClient.on('connect', () => {
      this.logger.log(`Successfully connected to the Redis`);
    });
  }
}
