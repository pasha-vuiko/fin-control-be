import { Cache } from 'cache-manager';
import Valkey from 'iovalkey';
import { afterEach, vi } from 'vitest';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { DEFAULT_CACHE_TTL } from '@shared/modules/cache/constants/defaults';
import { CACHE_MODULE_OPTIONS } from '@shared/modules/cache/providers/cache-module-options.provider';
import { CacheConfigService } from '@shared/modules/cache/services/cache-config/cache-config.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import { ValkeyService } from './valkey.service';

// eslint-disable-next-line max-lines-per-function
describe('ValkeyService()', () => {
  let service: ValkeyService;
  let cacheManager: Cache;
  let ioValkeyInstance: Valkey;

  beforeEach(async () => {
    vi.spyOn(CacheConfigService, 'getIoValkeyInstance').mockReturnValue(
      getMockedInstance(Valkey),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValkeyService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            wrap: vi.fn(),
            set: vi.fn(),
            get: vi.fn(),
          },
        },
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ValkeyService>(ValkeyService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    ioValkeyInstance = CacheConfigService.getIoValkeyInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('wrap()', () => {
    it('should return cached value if exists', async () => {
      const cacheKey = 'test-key';
      const cachedValue = { data: 'cached' };
      vi.spyOn(cacheManager, 'wrap').mockResolvedValue(cachedValue);

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
    it('should set raw value in Valkey and return it', async () => {
      const cacheKey = 'test-key';
      const value = 'raw-value';
      vi.spyOn(ioValkeyInstance, 'set').mockResolvedValue('OK');

      const result = await service.setRaw(cacheKey, value);

      expect(result).toEqual(value);
      expect(ioValkeyInstance.setex).toHaveBeenCalledWith(
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
    it('should return raw value from Valkey if exists', async () => {
      const cacheKey = 'test-key';
      const rawValue = 'raw-value';
      vi.spyOn(ioValkeyInstance, 'get').mockResolvedValue(rawValue);

      const result = await service.getRaw(cacheKey);

      expect(result).toEqual(rawValue);
      expect(ioValkeyInstance.get).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('ttl()', () => {
    it('should return ttl of the cache key', async () => {
      const cacheKey = 'test-key';
      const ttlValue = 60;
      vi.spyOn(ioValkeyInstance, 'ttl').mockResolvedValue(ttlValue);

      const result = await service.ttl(cacheKey);

      expect(result).toEqual(ttlValue);
      expect(ioValkeyInstance.ttl).toHaveBeenCalledWith(cacheKey);
    });
  });
});
