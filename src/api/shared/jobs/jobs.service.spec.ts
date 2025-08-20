import { ExpensesService } from '@api/domain/expenses/services/expenses.service';
import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let jobsService: JobsService;
  let regularPaymentsService: RegularPaymentsService;
  let expensesService: ExpensesService;

  beforeEach(async () => {
    regularPaymentsService = getMockedInstance(RegularPaymentsService);
    expensesService = getMockedInstance(ExpensesService);

    jobsService = new JobsService(regularPaymentsService, expensesService);
  });

  it('should be defined', () => {
    expect(jobsService).toBeDefined();
  });
});
