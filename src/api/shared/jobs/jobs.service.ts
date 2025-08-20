import { Injectable } from '@nestjs/common';

import { ISchedulerJobBody } from '@shared/modules/d-kron/interfaces/scheduler-job-body.interface';

import { ExpensesService } from '@api/domain/expenses/services/expenses.service';
import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';
import { JobType } from '@api/shared/jobs/enums/job-type.enum';

@Injectable()
export class JobsService {
  constructor(
    private readonly regularPaymentsService: RegularPaymentsService,
    private readonly expensesService: ExpensesService,
  ) {}

  async executeJob(dto: ISchedulerJobBody): Promise<void> {
    if (dto.jobType === JobType.REGULAR_PAYMENT_APPLY && dto.payload.regularPaymentId) {
      const { dateOfCharge, amount, category, customerId } =
        await this.regularPaymentsService.findOneAsAdmin(dto.payload.regularPaymentId);

      await this.expensesService.createOne(
        {
          date: dateOfCharge.toString(),
          amount,
          category,
        },
        customerId,
      );
    }
  }
}
