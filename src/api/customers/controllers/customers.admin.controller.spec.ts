import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { CustomersService } from '@api/customers/services/customers.service';

import { CustomersAdminController } from './customers.admin.controller';

describe('CustomersAdminController', () => {
  let controller: CustomersAdminController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersAdminController],
      providers: [
        CustomersService,
        CustomersRepository,
        {
          provide: DRIZZLE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CustomersAdminController>(CustomersAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
