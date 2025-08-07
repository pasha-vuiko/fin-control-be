import { HttpStatus } from '@nestjs/common';

import { VERIFICATION_CODE_RESEND_THRESHOLD } from '@shared/modules/email/constants/verification-code-resend-threshold';
import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 6;
appExceptionsRegistry.registerFlow(FLOW_ID, 'Email');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.CONFLICT, 0),
  'Email verification flow is already started',
)
export class EmailVerificationAlreadyStartedException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.PRECONDITION_REQUIRED, 1),
  'Email verification flow is not started',
)
export class EmailVerificationNotStartedException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.TOO_MANY_REQUESTS, 2),
  `You can resend verification code once per ${VERIFICATION_CODE_RESEND_THRESHOLD} seconds`,
)
export class EmailVerificationCodeThresholdException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 3),
  'The provided verification code is not valid',
)
export class EmailVerificationCodeInvalidException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 4),
  'Failed to send ses-email',
)
export class FailedToSendEmailException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 5),
  'The provided verification code is expired',
)
export class EmailVerificationCodeExpiredException extends AppException {}
