import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
