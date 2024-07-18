import Redis from 'ioredis';
import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsService } from '../services/regular-payments.service';
import { RegularPaymentsController } from './regular-payments.controller';

class MockPrismaService {}

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest.spyOn(RedisConfigService, 'getIoRedisInstance').mockReturnValue({} as Redis);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule, ExpensesModule],
      controllers: [RegularPaymentsController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();

    controller = module.get<RegularPaymentsController>(RegularPaymentsController);
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
