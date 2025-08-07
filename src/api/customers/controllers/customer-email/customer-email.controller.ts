import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';

@ApiTags('Customers')
@Controller('customer/email')
@Auth(Roles.CUSTOMER)
export class CustomerEmailController {}
