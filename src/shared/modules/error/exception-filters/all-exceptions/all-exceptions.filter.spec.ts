import { createError as createFastifyError } from '@fastify/error';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { afterEach, beforeEach, describe, expect } from 'vitest';

import { ArgumentsHost, HttpException, NotFoundException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import {
  AllExceptionsFilter,
  ErrorResponse,
} from '@shared/modules/error/exception-filters/all-exceptions/all-exceptions.filter';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { mapHttpStatusCodeToCommonAppErrorCode } from '@shared/modules/error/utils/map-http-status-code-to-common-app-error-code.util';

let allExceptionsFilter: AllExceptionsFilter;
let argumentHost: ArgumentsHost;
let httpArgumentHost: HttpArgumentsHost;
let request: FastifyRequest;
let response: FastifyReply;

// eslint-disable-next-line max-lines-per-function
describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    allExceptionsFilter = new AllExceptionsFilter();
    argumentHost = getArgumentHost();
    httpArgumentHost = getHttpArgumentHost();
    request = getRequest();
    response = getResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // eslint-disable-next-line max-lines-per-function
  describe('catch()', async () => {
    it('should send err response from AppException (4xx) and log warn', () => {
      class MyAppException extends AppException {}
      const err = new MyAppException('Boom', {
        errorCode: '1.404.1',
        name: 'MyAppException',
      });

      // @ts-expect-error private logger access for spy
      vi.spyOn(allExceptionsFilter.logger, 'warn').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(err, argumentHost);

      const expectedResponse = new ErrorResponse({
        code: '1.404.1',
        description: 'Boom',
        message: 'MyAppException',
        reqId: getRequestId(),
      });
      expect(response.status).toBeCalledWith(404);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should send err response from AppException (5xx) and log error', () => {
      class MyAppException extends AppException {}
      const err = new MyAppException('Server down', {
        errorCode: '1.500.1',
        name: 'MyAppException',
      });

      // @ts-expect-error private logger access for spy
      vi.spyOn(allExceptionsFilter.logger, 'error').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(err, argumentHost);

      const expectedResponse = new ErrorResponse({
        code: '1.500.1',
        description: 'Server down',
        message: 'MyAppException',
        reqId: getRequestId(),
      });
      expect(response.status).toBeCalledWith(500);
      expect(response.send).toBeCalledWith(expectedResponse);
    });
    it('should send err response from HttpException and track error', () => {
      const errMessage = 'The record is not found';
      const notFoundException = new NotFoundException(errMessage);

      const trackExceptionFn = vi.fn();

      const localAllExceptionFileter = new AllExceptionsFilter({
        trackException: trackExceptionFn,
      });

      // @ts-expect-error access to private field 'logger'
      vi.spyOn(localAllExceptionFileter.logger, 'warn').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      localAllExceptionFileter.catch(notFoundException, argumentHost);

      const expectedStatus = notFoundException.getStatus();
      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(404),
        description: errMessage,
        message: (notFoundException.getResponse() as any).error,
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(expectedStatus);
      expect(response.send).toBeCalledWith(expectedResponse);
      expect(trackExceptionFn).toHaveBeenCalledOnce();
    });

    it('should send err response from HttpException where .getResponse() returns string', () => {
      const errMessage = 'The record is not found';
      const notFoundException = new NotFoundException(errMessage);

      // @ts-expect-error access to private field 'logger'
      vi.spyOn(allExceptionsFilter.logger, 'warn').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');
      vi.spyOn(notFoundException, 'getResponse').mockReturnValue(errMessage);

      allExceptionsFilter.catch(notFoundException, argumentHost);

      const expectedStatus = notFoundException.getStatus();
      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(404),
        description: errMessage,
        message: 'Internal Server Error',
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(expectedStatus);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should send err response from FastifyError', () => {
      const errCode = 'FST_ERR_CTP_EMPTY_JSON_BODY';
      const errMessage = 'The record is not found';
      const errStatusCode = 400;

      const FastifyError = createFastifyError(errCode, errMessage, errStatusCode);
      const fastifyError = new FastifyError();

      // @ts-expect-error access to private field 'logger'
      vi.spyOn(allExceptionsFilter.logger, 'warn').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(fastifyError as any as FastifyError, argumentHost);

      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(400),
        description: errMessage,
        message: errCode,
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(errStatusCode);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should send err response and log error for FastifyError with 5xx', () => {
      const errCode = 'FST_ERR_INTERNAL_SERVER';
      const errMessage = 'Internal';
      const errStatusCode = 500;

      const FastifyError = createFastifyError(errCode, errMessage, errStatusCode);
      const fastifyError = new FastifyError();

      // @ts-expect-error access to private field 'logger'
      vi.spyOn(allExceptionsFilter.logger, 'error').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(fastifyError as any as FastifyError, argumentHost);

      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(500),
        description: errMessage,
        message: errCode,
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(errStatusCode);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should default to 500 and log error when FastifyError has no statusCode', () => {
      const err = {
        name: 'FastifyError',
        code: 'FST_ERR_UNKNOWN',
        message: 'oops',
      } as unknown as FastifyError;

      // @ts-expect-error private logger spy
      vi.spyOn(allExceptionsFilter.logger, 'error').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(err, argumentHost);

      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(500),
        description: 'oops',
        message: 'FST_ERR_UNKNOWN',
        reqId: getRequestId(),
      });
      expect(response.status).toBeCalledWith(500);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should log error for HttpException 5xx', () => {
      const ex = new HttpException('bad', 500);
      const errorSpy = vi
        // @ts-expect-error private logger
        .spyOn(allExceptionsFilter.logger, 'error')
        .mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(ex, argumentHost);

      expect(errorSpy).toHaveBeenCalled();
      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(500),
        description: 'bad',
        message: 'Internal Server Error',
        reqId: getRequestId(),
      });
      expect(response.status).toBeCalledWith(500);
      expect(response.send).toBeCalledWith(expectedResponse);
    });

    it('should send err response from Error', () => {
      const errMessage = 'The record is not found';
      const notFoundException = new Error(errMessage);

      // @ts-expect-error access to private field 'logger'
      vi.spyOn(allExceptionsFilter.logger, 'warn').mockReturnValue(undefined);
      // @ts-expect-error access to private field 'logger'
      vi.spyOn(allExceptionsFilter.logger, 'error').mockReturnValue(undefined);
      vi.spyOn(response, 'status');
      vi.spyOn(response, 'send');

      allExceptionsFilter.catch(notFoundException, argumentHost);

      const expectedStatusCode = 500;
      const expectedErrMessage = 'Internal Server Error';
      const expectedResponse = new ErrorResponse({
        code: mapHttpStatusCodeToCommonAppErrorCode(500),
        description: errMessage,
        message: expectedErrMessage,
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(expectedStatusCode);
      expect(response.send).toBeCalledWith(expectedResponse);
    });
  });
});

function getArgumentHost(): ArgumentsHost {
  return {
    switchToHttp(): HttpArgumentsHost {
      return httpArgumentHost;
    },
  } as ArgumentsHost;
}

function getHttpArgumentHost(): HttpArgumentsHost {
  return {
    getRequest(): FastifyRequest {
      return request;
    },
    getResponse(): FastifyReply {
      return response;
    },
  } as HttpArgumentsHost;
}

function getRequestId(): string {
  return 'mock-request-id';
}

function getRequest(): FastifyRequest {
  return {
    id: getRequestId(),
  } as FastifyRequest;
}

function getResponse(): FastifyReply {
  return {
    status(_status: number): any {
      return this;
    },
    send(_responsePayload: any) {
      return this;
    },
  } as FastifyReply;
}
