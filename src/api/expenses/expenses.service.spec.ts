import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';

import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpensesService } from './expenses.service';
import { CustomersModule } from '@api/customers/customers.module';

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule.forRoot(), CustomersModule],
      providers: [ExpensesService, ExpensesRepository],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
