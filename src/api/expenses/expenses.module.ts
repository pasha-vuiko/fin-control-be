import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { CustomersModule } from '@api/customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
