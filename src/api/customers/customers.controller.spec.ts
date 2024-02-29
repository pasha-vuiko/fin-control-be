import { Test, TestingModule } from '@nestjs/testing';

import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    jest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot()],
      controllers: [CustomersController],
      providers: [CustomersService, CustomersRepository],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
