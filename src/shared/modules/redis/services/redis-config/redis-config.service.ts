import { RedisOptions } from 'ioredis';
import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { CacheStoreFactory } from '@nestjs/common/cache/interfaces/cache-manager.interface';

import { REDIS_STORE } from '@shared/modules/redis/providers/redis-store.provider';
import { config } from '../../../../../app.config';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static ioRedisInstance: IoredisWithDefaultTtl;
  private static logger = new Logger('RedisConfigService');

  constructor(
    @Inject(REDIS_STORE)
    private redisStore: CacheStoreFactory,
  ) {}

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

    const redisConfig = this.getRedisConfig();
    RedisConfigService.ioRedisInstance = new IoredisWithDefaultTtl(redisConfig);

    this.listenToRedisError(RedisConfigService.ioRedisInstance);

    return RedisConfigService.ioRedisInstance;
  }

  private static getRedisConfig(): RedisOptions & { ttl?: number } {
    const { sentinels, name, host, port, defaultTTL } = { ...config.cache.redis };
    const baseConfig = {
      enableAutoPipelining: true,
      ttl: Number(defaultTTL),
    };

    if (sentinels && name) {
      const formattedSentinels = sentinels.split(',').map((hostPort: string) => {
        const [sentinelHost, sentinelPort] = hostPort.split(':');

        return {
          host: sentinelHost,
          port: Number(sentinelPort),
        };
      });

      return {
        ...baseConfig,
        name,
        sentinels: formattedSentinels,
      };
    }

    return {
      ...baseConfig,
      host,
      port: Number(port),
    };
  }

  private static listenToRedisError(redisClient: IoredisWithDefaultTtl): void {
    redisClient.on('error', err => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }
}
