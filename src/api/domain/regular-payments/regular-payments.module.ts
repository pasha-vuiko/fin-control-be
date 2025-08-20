import { Module } from '@nestjs/common';

import { CustomersModule } from '@api/domain/customers/customers.module';
import { ExpensesModule } from '@api/domain/expenses/expenses.module';
import { RegularPaymentsRepository } from '@api/domain/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentsAdminController } from './controllers/regular-payments.admin.controller';
import { RegularPaymentsController } from './controllers/regular-payments.controller';
import { RegularPaymentsService } from './services/regular-payments.service';

@Module({
  imports: [CustomersModule, ExpensesModule],
  controllers: [RegularPaymentsController, RegularPaymentsAdminController],
  providers: [RegularPaymentsService, RegularPaymentsRepository],
  exports: [RegularPaymentsService],
})
export class RegularPaymentsModule {}
