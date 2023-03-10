import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    jest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
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
