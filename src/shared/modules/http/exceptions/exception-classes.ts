import { HttpStatus } from '@nestjs/common';

import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import {
  AppException,
  AppExceptionOptionsWithCause,
} from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';
import { screamingSnakeToPascalCase } from '@shared/utils/screaming-snake-case-to-pascal-case.util';

const FLOW_ID = 10;

appExceptionsRegistry.registerFlow(FLOW_ID, 'HTTP Module (Downstream requests)');

export class HttpServiceException extends AppException {
  constructor(
    message: string,
    statusCode: number,
    options?: AppExceptionOptionsWithCause,
  );
  constructor(message: string, options?: AppExceptionOptionsWithCause);
  constructor(
    message: string,
    statusCodeOrOptions?: AppExceptionOptionsWithCause | number,
    options?: AppExceptionOptionsWithCause,
  ) {
    const errorCode =
      typeof statusCodeOrOptions === 'number'
        ? createErrCode(FLOW_ID, statusCodeOrOptions, 0)
        : createErrCode(FLOW_ID, 500, 0);

    if (options) {
      super(message, { ...options, errorCode });
    } else {
      super(message, { errorCode });
    }
  }

  // Self registering HttpServiceException cases with all possible HTTP status codes
  static {
    for (const [name, code] of Object.entries(HttpStatus)) {
      if (typeof code !== 'number') {
        continue;
      }
      if (code < 400) {
        continue;
      }

      const description = screamingSnakeToPascalCase(name, true);
      const httpServiceException = new HttpServiceException(description, code);

      appExceptionsRegistry.registerException(httpServiceException);
    }
  }
}
