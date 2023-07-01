import { Module } from '@nestjs/common';

import { CustomersModule } from '@api/customers/customers.module';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [CustomersModule],
  exports: [ExpensesService],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
