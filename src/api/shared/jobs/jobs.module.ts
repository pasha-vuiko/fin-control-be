import { Module } from '@nestjs/common';

import { ExpensesModule } from '@api/domain/expenses/expenses.module';
import { RegularPaymentsModule } from '@api/domain/regular-payments/regular-payments.module';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [ExpensesModule, RegularPaymentsModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
