import { Module } from '@nestjs/common';

import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
  exports: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
