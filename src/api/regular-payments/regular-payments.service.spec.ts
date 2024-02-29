import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsService', () => {
  let service: RegularPaymentsService;

  beforeEach(async () => {
    jest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule, ExpensesModule, PrismaModule.forRoot()],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    }).compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);
  });

  afterEach(async () => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
