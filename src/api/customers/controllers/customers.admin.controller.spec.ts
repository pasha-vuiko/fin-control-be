import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { CustomersService } from '@api/customers/services/customers.service';

import { CustomersAdminController } from './customers.admin.controller';

class MockPrismaService {}

describe('CustomersAdminController', () => {
  let controller: CustomersAdminController;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot()],
      controllers: [CustomersAdminController],
      providers: [CustomersService, CustomersRepository],
    })
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useClass(MockPrismaService)
      .compile();

    controller = module.get<CustomersAdminController>(CustomersAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
