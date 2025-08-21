import { PartialType } from '@nestjs/swagger';

import { RegularPaymentCreateDto } from './regular-payment-create.dto';

export class RegularPaymentUpdateDto extends PartialType(RegularPaymentCreateDto) {}
