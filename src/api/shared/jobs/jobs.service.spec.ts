import { ExpenseCategory } from '@prisma-definitions/client/client';
import { vi } from 'vitest';

import { ExpensesService } from '@api/domain/expenses/services/expenses.service';
import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';
import { JobType } from '@api/shared/jobs/enums/job-type.enum';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { JobsService } from './jobs.service';

// eslint-disable-next-line max-lines-per-function
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

  // eslint-disable-next-line max-lines-per-function
  describe('executeJob()', () => {
    it('applies regular payment by creating expense when payload has id', async () => {
      const regularPaymentId = 'rp-1';
      const dateOfCharge = new Date('2024-01-15T00:00:00.000Z');
      const mockRegularPayment = {
        id: regularPaymentId,
        customerId: 'cust-1',
        amount: 123.45,
        category: ExpenseCategory.FOOD,
        dateOfCharge,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(regularPaymentsService, 'findOneAsAdmin').mockResolvedValueOnce(
        mockRegularPayment as any,
      );
      vi.spyOn(expensesService, 'createOne').mockResolvedValueOnce({} as any);

      await jobsService.executeJob({
        jobName: 'any',
        jobType: JobType.REGULAR_PAYMENT_APPLY,
        payload: { regularPaymentId },
      });

      expect(regularPaymentsService.findOneAsAdmin).toHaveBeenCalledWith(
        regularPaymentId,
      );
      expect(expensesService.createOne).toHaveBeenCalledWith(
        {
          date: dateOfCharge.toString(),
          amount: mockRegularPayment.amount,
          category: mockRegularPayment.category,
        },
        mockRegularPayment.customerId,
      );
    });

    it('does nothing when job type matches but payload lacks regularPaymentId', async () => {
      const regularPaymentsServiceFindOneAsAdminSpy = vi.spyOn(
        regularPaymentsService,
        'findOneAsAdmin',
      );
      const expensesServiceCreateOneSpy = vi.spyOn(expensesService, 'createOne');

      await jobsService.executeJob({
        jobName: 'any',
        jobType: JobType.REGULAR_PAYMENT_APPLY,
        payload: {},
      });

      expect(regularPaymentsServiceFindOneAsAdminSpy).not.toHaveBeenCalled();
      expect(expensesServiceCreateOneSpy).not.toHaveBeenCalled();
    });

    it('does nothing for unrelated job types', async () => {
      const regularPaymentsServiceFindOneAsAdminSpy = vi.spyOn(
        regularPaymentsService,
        'findOneAsAdmin',
      );
      const expensesServiceCreateOneSpy = vi.spyOn(expensesService, 'createOne');

      await jobsService.executeJob({
        jobName: 'any',
        jobType: 'some-other-job',
        payload: { regularPaymentId: 'ignored' },
      });

      expect(regularPaymentsServiceFindOneAsAdminSpy).not.toHaveBeenCalled();
      expect(expensesServiceCreateOneSpy).not.toHaveBeenCalled();
    });

    it('propagates error if regular payment lookup fails', async () => {
      vi.spyOn(regularPaymentsService, 'findOneAsAdmin').mockRejectedValueOnce(
        new Error('lookup failed'),
      );

      const resultPromise = jobsService.executeJob({
        jobName: 'any',
        jobType: JobType.REGULAR_PAYMENT_APPLY,
        payload: { regularPaymentId: 'rp-err' },
      });

      await expect(resultPromise).rejects.toThrow('lookup failed');

      expect(expensesService.createOne).not.toHaveBeenCalled();
    });
  });
});
