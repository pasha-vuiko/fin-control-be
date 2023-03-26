import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    jest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, CustomersModule],
      controllers: [ExpensesController],
      providers: [ExpensesService, ExpensesRepository],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
