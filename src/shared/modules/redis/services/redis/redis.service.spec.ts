import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { afterEach, vi } from 'vitest';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { DEFAULT_CACHE_TTL } from '@shared/modules/redis/constants/defaults';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import { RedisService } from './redis.service';

// eslint-disable-next-line max-lines-per-function
describe('RedisService()', () => {
  let service: RedisService;
  let cacheManager: Cache;
  let ioRedisInstance: Redis;

  beforeEach(async () => {
    vi.spyOn(RedisConfigService, 'getIoRedisInstance').mockReturnValue(
      getMockedInstance(Redis),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            wrap: vi.fn(),
            set: vi.fn(),
            get: vi.fn(),
          },
        },
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    ioRedisInstance = RedisConfigService.getIoRedisInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('wrap()', () => {
    it('should return cached value if exists', async () => {
      const cacheKey = 'test-key';
      const cachedValue = { data: 'cached' };
      vi.spyOn(cacheManager, 'wrap').mockResolvedValue(cachedValue as any);

      const result = await service.wrap(cacheKey, async () => ({ data: 'fresh' }));

      expect(result).toEqual(cachedValue);
      expect(cacheManager.wrap).toHaveBeenCalledWith(
        cacheKey,
        expect.any(Function),
        DEFAULT_CACHE_TTL,
      );
    });
  });

  describe('set()', () => {
    it('should set value in cache and return it', async () => {
      const cacheKey = 'test-key';
      const value = { data: 'test' };
      vi.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.set(cacheKey, value);

      expect(result).toEqual(value);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, value, {
        ttl: DEFAULT_CACHE_TTL,
      });
    });
  });

  describe('setRaw()', () => {
    it('should set raw value in Redis and return it', async () => {
      const cacheKey = 'test-key';
      const value = 'raw-value';
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK');

      const result = await service.setRaw(cacheKey, value);

      expect(result).toEqual(value);
      expect(ioRedisInstance.setex).toHaveBeenCalledWith(
        cacheKey,
        DEFAULT_CACHE_TTL,
        value,
      );
    });
  });

  describe('get()', () => {
    it('should return value from cache if exists', async () => {
      const cacheKey = 'test-key';
      const cachedValue = { data: 'cached' };
      vi.spyOn(cacheManager, 'get').mockResolvedValue(cachedValue);

      const result = await service.get(cacheKey);

      expect(result).toEqual(cachedValue);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('getRaw()', () => {
    it('should return raw value from Redis if exists', async () => {
      const cacheKey = 'test-key';
      const rawValue = 'raw-value';
      vi.spyOn(ioRedisInstance, 'get').mockResolvedValue(rawValue);

      const result = await service.getRaw(cacheKey);

      expect(result).toEqual(rawValue);
      expect(ioRedisInstance.get).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('ttl()', () => {
    it('should return ttl of the cache key', async () => {
      const cacheKey = 'test-key';
      const ttlValue = 60;
      vi.spyOn(ioRedisInstance, 'ttl').mockResolvedValue(ttlValue);

      const result = await service.ttl(cacheKey);

      expect(result).toEqual(ttlValue);
      expect(ioRedisInstance.ttl).toHaveBeenCalledWith(cacheKey);
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('update()', () => {
    it('should swallow error via decorator when value is not cachable (undefined)', async () => {
      const setSpy = vi.spyOn(ioRedisInstance, 'set');

      const result = await service.update('k', undefined as unknown as any);

      expect(result).toBeUndefined();
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should swallow error via decorator when value is not cachable (function)', async () => {
      const setSpy = vi.spyOn(ioRedisInstance, 'set');
      const result = await service.update('k', () => {});

      expect(result).toBeUndefined();
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should set stringified object with KEEPTTL and return value', async () => {
      const key = 'obj-key';
      const value = { a: 1 };
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK' as any);

      const result = await service.update(key, value);

      expect(result).toEqual(value);
      expect(ioRedisInstance.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'KEEPTTL',
      );
    });

    it('should set string value with KEEPTTL and return value', async () => {
      const key = 'str-key';
      const value = 'hello';
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK' as any);

      const result = await service.update(key, value as any);

      expect(result).toEqual(value);
      expect(ioRedisInstance.set).toHaveBeenCalledWith(key, value as any, 'KEEPTTL');
    });

    it('should stringify boolean and set with KEEPTTL', async () => {
      const key = 'bool-key';
      const value = true;
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK' as any);

      const result = await service.update(key, value as any);

      expect(result).toEqual(value);
      expect(ioRedisInstance.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'KEEPTTL',
      );
    });
  });

  describe('checkIfExists()', () => {
    it('should return true when exists > 0', async () => {
      const key = 'exists-key';
      vi.spyOn(ioRedisInstance, 'exists').mockResolvedValue(1 as any);

      const result = await service.checkIfExists(key);

      expect(result).toBe(true);
      expect(ioRedisInstance.exists).toHaveBeenCalledWith(key);
    });

    it('should return false when exists == 0', async () => {
      const key = 'not-exists-key';
      vi.spyOn(ioRedisInstance, 'exists').mockResolvedValue(0 as any);

      const result = await service.checkIfExists(key);

      expect(result).toBe(false);
      expect(ioRedisInstance.exists).toHaveBeenCalledWith(key);
    });
  });

  describe('delete()', () => {
    it('should return true when del returns > 0', async () => {
      const key = 'del-key';
      vi.spyOn(ioRedisInstance, 'del').mockResolvedValue(1 as any);

      const result = await service.delete(key);

      expect(result).toBe(true);
      expect(ioRedisInstance.del).toHaveBeenCalledWith(key);
    });

    it('should return false when del returns 0', async () => {
      const key = 'del-missing';
      vi.spyOn(ioRedisInstance, 'del').mockResolvedValue(0 as any);

      const result = await service.delete(key);

      expect(result).toBe(false);
      expect(ioRedisInstance.del).toHaveBeenCalledWith(key);
    });
  });
});
