import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { CustomersModule } from '@api/customers/customers.module';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule, CustomersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
