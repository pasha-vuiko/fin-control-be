import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpensesService } from './expenses.service';

class MockPrismaService {}

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule],
      providers: [ExpensesService, ExpensesRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
