import Redis from 'ioredis';
import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';
import { RegularPaymentsService } from '@api/regular-payments/services/regular-payments.service';

import { RegularPaymentsAdminController } from './regular-payments.admin.controller';

class MockPrismaService {}

describe('RegularPaymentsAdminController', () => {
  let controller: RegularPaymentsAdminController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest.spyOn(RedisConfigService, 'getIoRedisInstance').mockReturnValue({} as Redis);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule, ExpensesModule],
      controllers: [RegularPaymentsAdminController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();
    controller = module.get<RegularPaymentsAdminController>(
      RegularPaymentsAdminController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
