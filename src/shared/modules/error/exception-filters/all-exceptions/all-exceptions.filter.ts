import { FastifyError, type FastifyReply, type FastifyRequest } from 'fastify';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { mapHttpStatusCodeToCommonAppErrorCode } from '@shared/modules/error/utils/map-http-status-code-to-common-app-error-code.util';
import { Logger } from '@shared/modules/logger/loggers/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);

  constructor(private config?: IAllExceptionsFilterConfig) {}

  catch(
    exception: AppException | HttpException | FastifyError | Error,
    host: ArgumentsHost,
  ): void {
    const trackException = this.config?.trackException;

    if (trackException) {
      trackException(exception);
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const { payload, httpCode } = this.getResponsePayload(exception, request.id);

    response.status(httpCode).send(payload);
  }

  // eslint-disable-next-line max-lines-per-function
  private getResponsePayload(
    exception: AppException | HttpException | FastifyError | Error,
    reqId: string,
  ): { payload: ErrorResponse; httpCode: number } {
    if (exception instanceof AppException) {
      const httpStatusCode = exception.getHttpStatusCode();

      if (httpStatusCode >= 500) {
        this.logger.error('Request failed with exception', exception);
      } else {
        this.logger.warn('Request failed with exception', exception);
      }

      return {
        payload: this.mapAppExceptionToErrorResponse(exception, reqId),
        httpCode: httpStatusCode,
      };
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();

      if (httpStatus >= 500) {
        this.logger.error('Request failed with exception', exception);
      } else {
        this.logger.warn('Request failed with exception', exception);
      }

      return {
        payload: this.mapNestExceptionToErrorResponse(exception, reqId),
        httpCode: httpStatus,
      };
    }

    if (this.isFastifyError(exception)) {
      if (exception.statusCode && exception.statusCode >= 500) {
        this.logger.error('Request failed with Fastify exception', exception);
      } else if (exception.statusCode) {
        this.logger.warn('Request failed with Fastify exception', exception);
      } else {
        this.logger.error('Request failed with Fastify exception', exception);
      }

      return {
        payload: this.mapFastifyErrorToErrorResponse(exception, reqId),
        httpCode: exception.statusCode ?? 500,
      };
    }

    this.logger.error(`Request failed with error`, exception);

    const httpStatusCode = 500;

    return {
      payload: new ErrorResponse(
        new InternalResponseError(
          reqId,
          mapHttpStatusCodeToCommonAppErrorCode(httpStatusCode),
          'Internal Server Error',
          exception.message,
        ),
      ),
      httpCode: httpStatusCode,
    };
  }

  private getExceptionResponse(exception: HttpException): IExceptionResponse {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        error: 'Internal Server Error',
        message: exceptionResponse,
      };
    }

    return exceptionResponse as IExceptionResponse;
  }

  private mapAppExceptionToErrorResponse(
    exception: AppException,
    reqId: string,
  ): ErrorResponse {
    return {
      error: {
        reqId,
        code: exception.errorCode,
        message: exception.name,
        description: exception.message,
      },
    };
  }

  private mapNestExceptionToErrorResponse(
    exception: HttpException,
    reqId: string,
  ): ErrorResponse {
    const httpStatusCode = exception.getStatus();
    const exceptionResponse = this.getExceptionResponse(exception);

    return {
      error: {
        reqId,
        code: mapHttpStatusCodeToCommonAppErrorCode(httpStatusCode),
        message: exceptionResponse.error ?? exception.name,
        description: exceptionResponse.message,
      },
    };
  }

  private mapFastifyErrorToErrorResponse(
    error: FastifyError,
    reqId: string,
  ): ErrorResponse {
    const httpStatusCode = error.statusCode ?? 500;
    const proprietaryCode = mapHttpStatusCodeToCommonAppErrorCode(httpStatusCode);

    return new ErrorResponse(
      new InternalResponseError(reqId, proprietaryCode, error.code, error.message),
    );
  }

  private isFastifyError(error: FastifyError | Error): error is FastifyError {
    return error.name === 'FastifyError';
  }
}

export interface IAllExceptionsFilterConfig {
  trackException?: (exception: Error) => void;
}

interface IExceptionResponse {
  error: string;
  message: string;
}

export class InternalResponseError {
  @ApiProperty()
  reqId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  description: string;

  constructor(reqId: string, code: string, message: string, description: string) {
    this.reqId = reqId;
    this.code = code;
    this.message = message;
    this.description = description;
  }
}

export class ErrorResponse {
  @ApiProperty()
  error: InternalResponseError;

  constructor(error: InternalResponseError) {
    this.error = error;
  }

  static getExample(
    code: string,
    message = 'string',
    description = 'string',
  ): ErrorResponse {
    return new ErrorResponse({
      reqId: '84ad6c47-4dd0-4b31-987d-1f45e093ec92',
      code: code,
      message,
      description,
    });
  }
}
