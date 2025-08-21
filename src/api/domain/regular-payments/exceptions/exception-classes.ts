import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 3;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Regular payments');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.NOT_FOUND, 0),
  'Regular payment is not found',
)
export class RegularPaymentNotFoundException extends AppException {}
