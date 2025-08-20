// test/unit-tests-setup.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import undici from 'undici';
import { vi } from 'vitest';

import { Logger } from '@shared/modules/logger/loggers/logger';

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
