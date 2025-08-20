import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { ApiAppExceptionsRes } from '@shared/modules/error/open-api/api-app-exceptions-response.decorator';

import { RegularPaymentSearchDto } from '@api/domain/regular-payments/dto/regular-payment-search.dto';
import { RegularPaymentEntity } from '@api/domain/regular-payments/entities/regular-payment.entity';
import { RegularPaymentNotFoundException } from '@api/domain/regular-payments/exceptions/exception-classes';
import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';

@ApiTags('Admin/Regular Payments')
@Controller('customer-admin/regular-payments')
@Auth(Roles.ADMIN)
export class RegularPaymentsAdminController {
  constructor(private readonly regularPaymentsService: RegularPaymentsService) {}

  @ApiPagePaginatedRes(RegularPaymentEntity)
  @Get()
  async findMany(
    @Query() findDto: RegularPaymentSearchDto,
  ): Promise<PagePaginationResEntity<RegularPaymentEntity>> {
    const { numOfItems, page } = findDto;

    const { items, total } = await this.regularPaymentsService.findManyAsAdmin({
      numOfItems,
      page,
    });

    return { items, total, page, numOfItems };
  }

  @ApiAppExceptionsRes(RegularPaymentNotFoundException)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.findOneAsAdmin(id);
  }
}
