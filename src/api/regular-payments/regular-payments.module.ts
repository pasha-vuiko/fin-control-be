import { Module } from '@nestjs/common';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesModule } from '@api/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsController } from './regular-payments.controller';
import { RegularPaymentsService } from './regular-payments.service';

@Module({
  imports: [CustomersModule, ExpensesModule],
  controllers: [RegularPaymentsController],
  providers: [RegularPaymentsService, RegularPaymentsRepository],
})
export class RegularPaymentsModule {}
