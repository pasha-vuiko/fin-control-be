import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { ExpensesService } from '@api/expenses/services/expenses.service';

import { ExpensesAdminController } from './expenses.admin.controller';

class MockPrismaService {}

describe('ExpensesAdminController', () => {
  let controller: ExpensesAdminController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule],
      controllers: [ExpensesAdminController],
      providers: [ExpensesService, ExpensesRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();

    controller = module.get<ExpensesAdminController>(ExpensesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
