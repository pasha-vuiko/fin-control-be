import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from '@shared/modules/prisma/prisma.module';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsService', () => {
  let service: RegularPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule, ExpensesModule, PrismaModule.forRoot()],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    }).compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
