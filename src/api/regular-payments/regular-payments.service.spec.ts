import { Test, TestingModule } from '@nestjs/testing';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsController } from '@api/regular-payments/regular-payments.controller';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsService', () => {
  let service: RegularPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule, ExpensesModule],
      controllers: [RegularPaymentsController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    }).compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
