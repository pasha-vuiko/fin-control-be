import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';

import { CustomersFindDto } from '@api/customers/dto/customers-find.dto';
import { CustomerEntity } from '@api/customers/entities/customer.entity';

import { CustomersService } from './customers.service';
import { CustomerCreateDto } from './dto/customer-create.dto';
import { CustomerUpdateDto } from './dto/customer-update.dto';

// TODO Add method to change customers Email and Phone
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @ApiPagePaginatedRes(CustomerEntity)
  @Auth(Roles.ADMIN)
  @Get()
  async findMany(
    @Query() findDto: CustomersFindDto,
  ): Promise<PagePaginationResEntity<CustomerEntity>> {
    const { page, numOfItems } = findDto;

    const { total, items } = await this.customerService.findMany({ page, numOfItems });

    return {
      items,
      total,
      page,
      numOfItems,
    };
  }

  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get('self')
  findOneByUserId(@User() user: IUser): Promise<CustomerEntity> {
    return this.customerService.findOneByUserId(user.id);
  }

  @JsonCache()
  @Auth(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customerService.findOneByIdAsAdmin(id);
  }

  @Auth(Roles.CUSTOMER)
  @Post()
  create(
    @Body() createCustomerDto: CustomerCreateDto,
    @User() user: IUser,
  ): Promise<CustomerEntity> {
    return this.customerService.create(createCustomerDto, user);
  }

  @Auth(Roles.ADMIN, Roles.CUSTOMER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() updateCustomerDto: CustomerUpdateDto,
  ): Promise<CustomerEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.customerService.updateAsAdmin(id, updateCustomerDto);
    }
    return this.customerService.updateAsCustomer(id, updateCustomerDto, user.id);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<CustomerEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.customerService.removeAsAdmin(id);
    }

    return this.customerService.removeAsCustomer(id, user.id);
  }
}
