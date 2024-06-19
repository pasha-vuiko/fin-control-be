import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';

import { CustomerUpdateDto } from '@api/customers/dto/customer-update.dto';
import { CustomersFindDto } from '@api/customers/dto/customers-find.dto';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { CustomersService } from '@api/customers/services/customers.service';

@ApiTags('Admin/Customers')
@Controller('admin/customers')
export class CustomersAdminController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiPagePaginatedRes(CustomerEntity)
  @Auth(Roles.ADMIN)
  @Get()
  async findMany(
    @Query() findDto: CustomersFindDto,
  ): Promise<PagePaginationResEntity<CustomerEntity>> {
    const { page, numOfItems } = findDto;

    const { total, items } = await this.customersService.findMany({ page, numOfItems });

    return {
      items,
      total,
      page,
      numOfItems: items.length,
    };
  }

  @Auth(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customersService.findOneByIdAsAdmin(id);
  }

  @Auth(Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: CustomerUpdateDto,
  ): Promise<boolean> {
    return this.customersService.updateAsAdmin(id, updateCustomerDto);
  }

  @Auth(Roles.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.customersService.removeAsAdmin(id);
  }
}
