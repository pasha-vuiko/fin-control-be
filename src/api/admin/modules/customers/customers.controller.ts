import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCustomerDto } from '@api/customers/dto/update-customer.dto';

@Controller('admin/customers')
@ApiTags('[Admin] Customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Auth(Roles.ADMIN)
  @Get()
  findMany(): Promise<CustomerEntity[]> {
    return this.customerService.findMany();
  }

  @JsonCache()
  @Auth(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customerService.findOne(id);
  }

  @Auth(Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Auth(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customerService.remove(id);
  }
}
