import { HttpStatus } from '@nestjs/common';

import { TAppErrorCode } from '@shared/modules/error/exceptions/exception-classes/app.exception';

export function createErrCode(
  flowId: number,
  httpStatus: HttpStatus | number,
  codeNumber: number,
): TAppErrorCode {
  return `${flowId}.${httpStatus}.${codeNumber}`;
}
