import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 4;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Authorization');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.UNAUTHORIZED, 0),
  'Token is not valid',
)
export class AuthInvalidTokenException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.UNAUTHORIZED, 1),
  'Token is expired',
)
export class AuthExpiredTokenException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.FORBIDDEN, 0),
  'User does not have permissions to access the resource',
)
export class AuthForbiddenException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 0),
  'Failed to update user email.',
)
export class UserEmailUpdateException extends AppException {}
