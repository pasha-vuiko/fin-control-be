import { Test, TestingModule } from '@nestjs/testing';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsController } from './regular-payments.controller';
import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule, ExpensesModule],
      controllers: [RegularPaymentsController],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    }).compile();

    controller = module.get<RegularPaymentsController>(RegularPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
