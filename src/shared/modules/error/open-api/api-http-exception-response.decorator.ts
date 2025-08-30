import { HttpException, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ErrorResponse } from '@shared/modules/error/exception-filters/all-exceptions/all-exceptions.filter';
import { mapHttpStatusCodeToCommonAppErrorCode } from '@shared/modules/error/utils/map-http-status-code-to-common-app-error-code.util';
import { TConstructor } from '@shared/types/constructor.type';

export const ApiHttpExceptionRes = <E extends TConstructor<HttpException>>(
  HttpExceptionConstructor: E,
  ...descriptions: string[]
): MethodDecorator => {
  const exception = new HttpExceptionConstructor();
  const status = exception.getStatus();

  return applyDecorators(
    ApiExtraModels(ErrorResponse),
    ApiResponse({
      status,
      content: getContent(HttpExceptionConstructor, descriptions),
    }),
  );
};

// eslint-disable-next-line max-lines-per-function
function getContent<E extends TConstructor<HttpException>>(
  HttpExceptionConstructor: E,
  descriptions: string[] = [],
): ContentObject {
  if (!descriptions.length || descriptions.length === 1) {
    const description = descriptions.at(0) ?? undefined;
    const exception = new HttpExceptionConstructor(description);

    const status = exception.getStatus();
    const errorCode = mapHttpStatusCodeToCommonAppErrorCode(status);
    const message = getExceptionResponse(exception).error ?? exception.name;
    const exampleDescription = exception.message;

    return {
      'application/json': {
        schema: {
          $ref: getSchemaPath(ErrorResponse),
        },
        example: ErrorResponse.getExample(errorCode, message, exampleDescription),
      },
    };
  }

  return {
    'application/json': {
      schema: {
        oneOf: descriptions.map(() => {
          return {
            $ref: getSchemaPath(ErrorResponse),
          };
        }),
      },
      examples: Object.fromEntries(
        descriptions.map(description => {
          const exception = new HttpExceptionConstructor(description);

          const status = exception.getStatus();
          const code = mapHttpStatusCodeToCommonAppErrorCode(status);
          const message = getExceptionResponse(exception).error ?? exception.name;
          const exampleDescription = description ?? exception.message;

          return [
            description,
            {
              value: ErrorResponse.getExample(code, message, exampleDescription),
            },
          ];
        }),
      ),
    },
  };
}

function getExceptionResponse(exception: HttpException): ExceptionResponse {
  const exceptionResponse = exception.getResponse();

  if (typeof exceptionResponse === 'string') {
    return {
      error: 'Internal Server Error',
      message: exceptionResponse,
    };
  }

  return exceptionResponse as ExceptionResponse;
}

interface ExceptionResponse {
  error: string;
  message: string;
}
