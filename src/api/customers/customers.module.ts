import { Module } from '@nestjs/common';

import { CustomerEmailController } from '@api/customers/controllers/customer-email/customer-email.controller';
import { CustomersAdminController } from '@api/customers/controllers/customers.admin.controller';
import { CustomersController } from '@api/customers/controllers/customers.controller';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { CustomersService } from './services/customers.service';

@Module({
  controllers: [CustomersController, CustomerEmailController, CustomersAdminController],
  providers: [CustomersService, CustomersRepository],
  exports: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
