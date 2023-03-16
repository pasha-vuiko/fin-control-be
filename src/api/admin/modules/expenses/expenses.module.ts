import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesModule } from '@api/expenses/expenses.module';

@Module({
  imports: [ExpensesModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class AdminExpensesModule {}
