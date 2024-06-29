import Redis from 'ioredis';
import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { mockModuleWithProviders } from '../../../../test/utils/mock-module-with-providers.util';
import { RegularPaymentsService } from '../services/regular-payments.service';
import { RegularPaymentsController } from './regular-payments.controller';

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue(getMockedInstance(Redis));

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        mockModuleWithProviders(DrizzleModule, [
          { provide: DRIZZLE_CLIENT, useValue: {} },
        ]),
        CustomersModule,
        ExpensesModule,
      ],
      controllers: [RegularPaymentsController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    })
      .overrideProvider(RegularPaymentsRepository) // Preventing connection to the database
      .useValue(getMockedInstance(RegularPaymentsRepository))
      .overrideProvider(CustomersRepository) // Preventing connection to the database
      .useValue(getMockedInstance(CustomersRepository))
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
