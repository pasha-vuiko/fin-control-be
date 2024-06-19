import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { CustomersService } from '../services/customers.service';
import { CustomersController } from './customers.controller';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [DrizzleModule.forRoot('', {} as any)],
      controllers: [CustomersController],
      providers: [CustomersService, CustomersRepository],
    })
      .overrideProvider(CustomersRepository)
      .useValue(getMockedInstance(CustomersRepository))
      .compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
