import Redis from 'ioredis';
import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpensesService } from '../services/expenses.service';
import { ExpensesController } from './expenses.controller';

class MockPrismaService {}

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest.spyOn(RedisConfigService, 'getIoRedisInstance').mockReturnValue({} as Redis);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule],
      controllers: [ExpensesController],
      providers: [ExpensesService, ExpensesRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
