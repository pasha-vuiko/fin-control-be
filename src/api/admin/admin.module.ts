import { Module } from '@nestjs/common';
import { AdminCustomersModule } from '@api/admin/modules/customers/customers.module';
import { AdminExpensesModule } from '@api/admin/modules/expenses/expenses.module';

@Module({
  imports: [AdminCustomersModule, AdminExpensesModule],
})
export class AdminModule {}
