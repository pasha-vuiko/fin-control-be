import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';

import { RegularPaymentSearchDto } from '@api/regular-payments/dto/regular-payment-search.dto';
import { RegularPaymentEntity } from '@api/regular-payments/entities/regular-payment.entity';

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

    return { items, total, page, numOfItems: items.length };
  }

  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.findOneAsCustomer(id, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Post()
  async create(
    @Body() createRegularPaymentDto: RegularPaymentCreateDto,
    @User() user: IUser,
  ): Promise<boolean> {
    return await this.regularPaymentsService.create(createRegularPaymentDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRegularPaymentDto: RegularPaymentUpdateDto,
    @User() user: IUser,
  ): Promise<boolean> {
    return await this.regularPaymentsService.update(id, updateRegularPaymentDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: IUser): Promise<boolean> {
    return await this.regularPaymentsService.delete(id, user.id);
  }

  // TODO Run in a separate service
  // TODO Add retry mechanism if failed to apply regular payments or process was down
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async applyRegularPayments(): Promise<void> {
    const logger = new Logger(RegularPaymentsController.name);

    const monthYear = new Date().toLocaleDateString('en-GB', {
      month: 'numeric',
      year: 'numeric',
    });

    logger.log(`Applying regular payments for ${monthYear}`);

    await this.regularPaymentsService
      .applyRegularPayments(monthYear)
      .then(() => logger.log(`Regular payments applied for ${monthYear} successfully`))
      .catch(e => logger.error(`Failed to apply regular payments for ${monthYear}`, e));
  }
}
