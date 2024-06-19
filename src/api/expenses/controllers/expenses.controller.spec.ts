import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { mockModuleWithProviders } from '../../../../test/utils/mock-module-providers.util';
import { ExpensesService } from '../services/expenses.service';
import { ExpensesController } from './expenses.controller';

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        mockModuleWithProviders(DrizzleModule, [{ provide: DRIZZLE_CLIENT, useValue: {} }]),
        CustomersModule,
      ],
      controllers: [ExpensesController],
      providers: [ExpensesService, ExpensesRepository],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
