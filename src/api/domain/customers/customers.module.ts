import { Module } from '@nestjs/common';

import { CustomersAdminController } from '@api/domain/customers/controllers/customers.admin.controller';
import { CustomersController } from '@api/domain/customers/controllers/customers.controller';
import { CustomersRepository } from '@api/domain/customers/repositories/customers.repository';

import { CustomersService } from './services/customers.service';

@Module({
  controllers: [CustomersController, CustomersAdminController],
  providers: [CustomersService, CustomersRepository],
  exports: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
