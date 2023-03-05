import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { ApiTags } from '@nestjs/swagger';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';

// TODO Add method to change customers Email and Phone
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Auth(Roles.ADMIN)
  @Get()
  findAll(): Promise<CustomerEntity[]> {
    return this.customerService.findMany();
  }

  @JsonCache()
  @Auth(Roles.ADMIN, Roles.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<CustomerEntity> {
    return this.customerService.findOne(id, user);
  }

  @Auth(Roles.ADMIN)
  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @User() user: IUser,
  ): Promise<CustomerEntity> {
    return this.customerService.create(createCustomerDto, user);
  }

  @Auth(Roles.ADMIN, Roles.CUSTOMER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    return this.customerService.update(id, updateCustomerDto, user);
  }

  @Auth(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customerService.remove(id);
  }
}
