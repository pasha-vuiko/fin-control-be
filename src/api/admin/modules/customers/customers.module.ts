import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersModule } from '@api/customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class AdminCustomersModule {}
