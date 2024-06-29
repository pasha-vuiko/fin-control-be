import { createError as createFastifyError } from '@fastify/error';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { afterEach, beforeEach, describe, expect } from 'vitest';

import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import {
  AllExceptionsFilter,
  ErrorResponse,
} from '@shared/modules/error/exception-filters/all-exceptions/all-exceptions.filter';

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
        code: '404.0.0',
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
        code: '404.0.0',
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
        code: '400.0.0',
        description: errMessage,
        message: errCode,
        reqId: getRequestId(),
      });

      expect(response.status).toBeCalledWith(errStatusCode);
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
        code: '500.0.0',
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
