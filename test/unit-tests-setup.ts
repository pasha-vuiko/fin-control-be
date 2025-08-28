// test/unit-tests-setup.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import undici from 'undici';
import { vi } from 'vitest';

import { Logger } from '@shared/modules/logger/loggers/logger';

// Ensure unit tests run in test mode so config guards are respected
process.env.NODE_ENV = 'test';
// Avoid reading .env.example in unit tests
vi.mock('@shared/utils/check-env-vars-set', () => ({
  checkEnvVarsSet: (): boolean => true,
}));

// Block outbound HTTP via undici by default; tests should stub per-case
vi.mock('undici', () => {
  return {
    __esModule: true,
    default: {
      request: vi.fn(async () => {
        throw new Error('Network call attempted in unit test. Stub/mocks required.');
      }),
    },
    Dispatcher: {},
  } as any;
});

// Prevent accidental Redis connections by mocking ioredis client
vi.mock('ioredis', () => {
  class MockRedis {
    // Methods defined on the prototype so tests can spy on them
    // and so getMockedInstance(MockRedis) can discover them
    on(): this {
      throw new Error('Redis on() called in unit tests. Stub Redis usage.');
    }
    disconnect(): void {
      // ignore to avoid unhandled rejections in teardown
    }
    async set(): Promise<'OK'> {
      throw new Error('Redis set() called in unit tests. Stub Redis usage.');
    }
    async setex(): Promise<'OK'> {
      throw new Error('Redis setex() called in unit tests. Stub Redis usage.');
    }
    async get(): Promise<string | null> {
      throw new Error('Redis get() called in unit tests. Stub Redis usage.');
    }
    async ttl(): Promise<number> {
      throw new Error('Redis ttl() called in unit tests. Stub Redis usage.');
    }
    async exists(): Promise<number> {
      throw new Error('Redis exists() called in unit tests. Stub Redis usage.');
    }
    async del(): Promise<number> {
      throw new Error('Redis del() called in unit tests. Stub Redis usage.');
    }
  }
  return { __esModule: true, default: MockRedis } as any;
});

beforeEach(() => {
  // 1) Block outbound HTTP by default (unit tests should stub per-test)
  vi.spyOn(undici, 'request').mockRejectedValue(
    new Error('Network call attempted in unit test. Spy/mocks required.'),
  );

  // 2) Short-circuit Prisma connect/disconnect so services that call $connect() don’t hit DB
  vi.spyOn(PrismaClient.prototype, '$connect').mockResolvedValue();
  vi.spyOn(PrismaClient.prototype, '$disconnect').mockResolvedValue();

  // 3) Block any use of the node-postgres pool directly (Drizzle/Prisma adapters use this under the hood)
  vi.spyOn(Pool.prototype, 'connect').mockImplementation(async () => {
    throw new Error('DB connect attempted in unit test. Stub your data access.');
  });
  vi.spyOn(Pool.prototype, 'query').mockRejectedValue(
    new Error('DB query attempted in unit test. Stub your data access.'),
  );
  // Be lenient on pool shutdown to avoid unhandled rejections during teardown
  vi.spyOn(Pool.prototype, 'end').mockResolvedValue(undefined as unknown as void);

  // 3) Avoid logging
  vi.spyOn(Logger.prototype, 'verbose').mockReturnValue();
  vi.spyOn(Logger.prototype, 'debug').mockReturnValue();
  vi.spyOn(Logger.prototype, 'log').mockReturnValue();
  vi.spyOn(Logger.prototype, 'warn').mockReturnValue();
  vi.spyOn(Logger.prototype, 'error').mockReturnValue();
});

afterEach(() => {
  vi.restoreAllMocks();
});
