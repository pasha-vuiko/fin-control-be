import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 2;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Expenses');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.NOT_FOUND, 0),
  'Expense is not found',
)
export class ExpenseIsNotFoundException extends AppException {}
