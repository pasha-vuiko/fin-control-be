import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';
import { RegularPaymentsService } from '@api/regular-payments/services/regular-payments.service';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { mockModuleWithProviders } from '../../../../test/utils/mock-module-with-providers.util';
import { RegularPaymentsAdminController } from './regular-payments.admin.controller';

describe('RegularPaymentsAdminController', () => {
  let controller: RegularPaymentsAdminController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        mockModuleWithProviders(DrizzleModule, [
          { provide: DRIZZLE_CLIENT, useValue: {} },
        ]),
        CustomersModule,
        ExpensesModule,
      ],
      controllers: [RegularPaymentsAdminController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    })
      .overrideProvider(RegularPaymentsRepository) // Preventing connection to the database
      .useValue(getMockedInstance(RegularPaymentsRepository))
      .compile();
    controller = module.get<RegularPaymentsAdminController>(
      RegularPaymentsAdminController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
