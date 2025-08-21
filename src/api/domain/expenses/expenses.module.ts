import { Module } from '@nestjs/common';

import { CustomersModule } from '@api/domain/customers/customers.module';
import { ExpensesAdminController } from '@api/domain/expenses/controllers/expenses.admin.controller';
import { ExpensesController } from '@api/domain/expenses/controllers/expenses.controller';
import { ExpensesRepository } from '@api/domain/expenses/repositories/expenses.repository';

import { ExpensesService } from './services/expenses.service';

@Module({
  imports: [CustomersModule],
  exports: [ExpensesService],
  controllers: [ExpensesController, ExpensesAdminController],
  providers: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
