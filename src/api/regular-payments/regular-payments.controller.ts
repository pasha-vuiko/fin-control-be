import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { isAdmin } from '@shared/modules/auth/utils/is-admin.util';
import { AppLogger } from '@shared/modules/logger/app-logger';

import { RegularPaymentSearchDto } from '@api/regular-payments/dto/regular-payment-search.dto';
import { RegularPaymentEntity } from '@api/regular-payments/entities/regular-payment.entity';

import { RegularPaymentCreateDto } from './dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from './dto/regular-payment-update.dto';
import { RegularPaymentsService } from './regular-payments.service';

@ApiTags('Regular Payments')
@Controller('regular-payments')
export class RegularPaymentsController {
  constructor(private readonly regularPaymentsService: RegularPaymentsService) {}

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get()
  findMany(
    @Query() filter: RegularPaymentSearchDto,
    @User() user: IUser,
  ): Promise<RegularPaymentEntity[]> {
    const { skip, take } = filter;

    if (isAdmin(user)) {
      return this.regularPaymentsService.findManyAsAdmin({ skip, take });
    }

    return this.regularPaymentsService.findManyAsCustomer(user.id, { skip, take });
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<RegularPaymentEntity> {
    if (isAdmin(user)) {
      return this.regularPaymentsService.findOneAsAdmin(id);
    }

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
  update(
    @Param('id') id: string,
    @Body() updateRegularPaymentDto: RegularPaymentUpdateDto,
    @User() user: IUser,
  ): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.update(id, updateRegularPaymentDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Delete(':id')
  delete(@Param('id') id: string, @User() user: IUser): Promise<RegularPaymentEntity> {
    return this.regularPaymentsService.delete(id, user.id);
  }

  // TODO Run in a separate service
  // TODO Add retry mechanism if failed to apply regular payments or process was down
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async applyRegularPayments(): Promise<void> {
    const logger = new AppLogger(RegularPaymentsController.name);

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
