import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 1;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Customer');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.NOT_FOUND, 0),
  'Customer is not found',
)
export class CustomerNotFoundException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.FORBIDDEN, 0),
  'You are not allowed to delete this customer',
)
export class ForbiddenToDeleteCustomerException extends AppException {}
