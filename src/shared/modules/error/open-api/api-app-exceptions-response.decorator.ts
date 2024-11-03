import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ErrorResponse } from '@shared/modules/error/exception-filters/all-exceptions/all-exceptions.filter';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { TConstructor } from '@shared/types/constructor.type';

export const ApiAppExceptionsRes = <E extends TConstructor<AppException>>(
  ...AppExceptionConstructorsOrInstances: (E | AppException)[]
): MethodDecorator => {
  const appExceptions = AppExceptionConstructorsOrInstances.map(
    ExceptionConstructorOrInstance =>
      ExceptionConstructorOrInstance instanceof AppException
        ? ExceptionConstructorOrInstance
        : new ExceptionConstructorOrInstance(),
  );
  const appExceptionsGroupedByHttpCode = Object.groupBy(appExceptions, appException =>
    appException.getHttpStatusCode().toString(),
  );

  const apiResponseDecorators: MethodDecorator[] = Object.entries(
    appExceptionsGroupedByHttpCode,
  ).map(([httpCode, appExceptions]) => {
    return ApiResponse({
      status: parseInt(httpCode),
      content: getContent(appExceptions ?? []),
    });
  });

  return applyDecorators(ApiExtraModels(ErrorResponse), ...apiResponseDecorators);
};

// eslint-disable-next-line max-lines-per-function
function getContent(appExceptions: AppException[]): ContentObject {
  if (!appExceptions.length) {
    throw new Error('appExceptions list cannot be empty');
  }

  if (appExceptions.length === 1) {
    // Cannot be empty because it handled above
    const exception = appExceptions.at(0) as AppException;

    const errorCode = exception.errorCode;
    const message = exception.name;
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
        oneOf: appExceptions.map(() => {
          return {
            $ref: getSchemaPath(ErrorResponse),
          };
        }),
      },
      examples: Object.fromEntries(
        appExceptions.map(exception => {
          const errorCode = exception.errorCode;
          const message = exception.name;
          const exampleDescription = exception.message;

          return [
            `[${errorCode}]: ${exception.message}`,
            {
              value: ErrorResponse.getExample(errorCode, message, exampleDescription),
            },
          ];
        }),
      ),
    },
  };
}
