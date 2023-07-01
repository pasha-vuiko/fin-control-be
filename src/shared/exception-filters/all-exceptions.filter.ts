import type { FastifyReply, FastifyRequest } from 'fastify';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

import { AppLogger } from '@shared/modules/logger/app-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new AppLogger(AllExceptionsFilter.name);

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const responsePayload = this.getResponsePayload(exception, request.id);
    const status = responsePayload.error.code;

    // @ts-expect-error for some reason type of parameter payload in send() is undefined
    response.status(status).send(responsePayload);
  }

  private getResponsePayload(
    exception: HttpException | Error,
    reqId: string,
  ): IErrorResponse {
    if (exception instanceof HttpException) {
      this.logger.debug('Request failed with exception', exception);

      const status = exception.getStatus();
      const exceptionResponse = this.getExceptionResponse(exception);

      return {
        error: {
          reqId,
          code: status,
          message: exceptionResponse.error,
          description: exceptionResponse.message,
        },
      };
    }

    this.logger.error(`Request failed with error`, exception);

    return {
      error: {
        reqId,
        code: 500,
        message: 'Internal server Error',
        description: exception.message,
      },
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
}

interface IExceptionResponse {
  error: string;
  message: string;
}

interface IErrorResponse {
  error: {
    reqId: string;
    code: number;
    message: string;
    description: string;
  };
}
