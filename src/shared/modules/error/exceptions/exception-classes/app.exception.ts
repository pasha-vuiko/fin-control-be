import { HttpException, HttpStatus } from '@nestjs/common';

import { mapHttpStatusCodeToCommonAppErrorCode } from '@shared/modules/error/utils/map-http-status-code-to-common-app-error-code.util';

const defaultMessage = 'Unknown error';
const defaultErrorCode = mapHttpStatusCodeToCommonAppErrorCode(
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export class AppException extends Error {
  readonly errorCode: TAppErrorCode;
  // override readonly message: string;

  constructor(options: IOptionsWithCause);
  constructor(message?: string, options?: IAppExceptionsOptions);
  constructor(
    messageOrCause: string | IOptionsWithCause | undefined,
    options?: IAppExceptionsOptions,
  ) {
    if (typeof messageOrCause === 'string' || typeof messageOrCause === 'undefined') {
      messageOrCause = messageOrCause ?? defaultMessage;

      const {
        cause,
        errorCode = defaultErrorCode,
        name = AppException.name,
      } = options ?? {};

      if (cause) {
        super(messageOrCause, { cause });
      } else {
        super(messageOrCause);
      }

      this.name = name;
      this.errorCode = errorCode;
    } else {
      super(defaultMessage);
      this.name = AppException.name;
      this.errorCode = defaultErrorCode;
    }
  }

  getHttpStatusCode(): HttpStatus | number {
    return Number(
      this.errorCode
        .split('.', ERR_CODE_HTTP_STATUS_INDEX + 1)
        .at(ERR_CODE_HTTP_STATUS_INDEX),
    );
  }

  static fromHttpException(exception: HttpException): AppException {
    const httpStatusCode = exception.getStatus();
    const message = exception.message;

    return new AppException(message, {
      cause: exception,
      name: exception.name,
      errorCode: mapHttpStatusCodeToCommonAppErrorCode(httpStatusCode),
    });
  }
}

export const ERR_CODE_FLOW_ID_INDEX = 0;
export const ERR_CODE_HTTP_STATUS_INDEX = 1;
export const ERR_CODE_ERR_ID_INDEX = 2;

export type TAppErrorCode = `${number}.${HttpStatus | number}.${number}`;

export interface IAppExceptionsOptions {
  cause?: Error | any;
  name?: string;
  errorCode?: TAppErrorCode;
}

export interface IOptionsWithCause {
  cause?: Error | any;
}
