import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { ApiAppExceptionsRes } from '@shared/modules/error/open-api/api-app-exceptions-response.decorator';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';

import { RegularPaymentSearchDto } from '@api/domain/regular-payments/dto/regular-payment-search.dto';
import { RegularPaymentEntity } from '@api/domain/regular-payments/entities/regular-payment.entity';
import { RegularPaymentNotFoundException } from '@api/domain/regular-payments/exceptions/exception-classes';

import { RegularPaymentCreateDto } from '../dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from '../dto/regular-payment-update.dto';
import { RegularPaymentsService } from '../services/regular-payments.service';

@ApiTags('Regular Payments')
@Controller('regular-payments')
export class RegularPaymentsController {
  constructor(private readonly regularPaymentsService: RegularPaymentsService) {}

  @ApiPagePaginatedRes(RegularPaymentEntity)
  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get()
  async findMany(
    @Query() findDto: RegularPaymentSearchDto,
    @User() user: IUser,
  ): Promise<PagePaginationResEntity<RegularPaymentEntity>> {
    const { numOfItems, page } = findDto;

    const { items, total } = await this.regularPaymentsService.findManyAsCustomer(
      user.id,
      { numOfItems, page },
    );

    return { items, total, page, numOfItems };
  }

  @ApiAppExceptionsRes(RegularPaymentNotFoundException)
  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.findOneAsCustomer(id, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Post()
  create(
    @Body() createRegularPaymentDto: RegularPaymentCreateDto,
    @User() user: IUser,
  ): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.create(createRegularPaymentDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRegularPaymentDto: RegularPaymentUpdateDto,
    @User() user: IUser,
  ): Promise<RegularPaymentEntity> {
    return await this.regularPaymentsService.update(id, updateRegularPaymentDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @User() user: IUser,
  ): Promise<RegularPaymentEntity | null> {
    return await this.regularPaymentsService.delete(id, user.id);
  }
}
