import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 15;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Job Scheduler');

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 0),
  'Failed to create scheduler job',
)
export class FailedToCreateJobException extends AppException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 1),
  'Failed to delete scheduler job',
)
export class FailedToDeleteJobException extends AppException {}
