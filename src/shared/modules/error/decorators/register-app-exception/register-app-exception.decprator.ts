import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import {
  AppException,
  IAppExceptionsOptions,
  IOptionsWithCause,
  TAppErrorCode,
} from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { TConstructor } from '@shared/types/constructor.type';

// TODO Add documentation
// eslint-disable-next-line max-lines-per-function
export const RegisterAppException = <T extends TConstructor<AppException>>(
  code: TAppErrorCode,
  message: string,
): ClassDecorator => {
  const httpStatusFromCodeStr = code.split('.').at(0) ?? 'undefined';
  const httpStatusFromCode = parseInt(httpStatusFromCodeStr);

  if (isNaN(httpStatusFromCode)) {
    throw new Error(
      `First part of error code should be a number, '${httpStatusFromCodeStr}' received instead`,
    );
  }
  if (httpStatusFromCode < 400 || httpStatusFromCode > 600) {
    throw new Error('Wrong HTTP error code');
  }

  //@ts-expect-error wrong type of target, TConstructor used as more convenient
  // eslint-disable-next-line max-lines-per-function
  return (constructor: T): T | void => {
    //@ts-expect-error mixing class constructor should have one argument which is any[]
    const GeneratedClass = class extends constructor {
      constructor(options: IOptionsWithCause);
      constructor(message?: string, options?: IAppExceptionsOptions);
      constructor(
        messageOrCause: string | IOptionsWithCause | undefined,
        options?: IAppExceptionsOptions,
      ) {
        if (typeof messageOrCause === 'string') {
          super(messageOrCause, {
            name: constructor.name,
            errorCode: code,
          });
        } else if (typeof messageOrCause === 'undefined') {
          super(message, {
            name: constructor.name,
            errorCode: code,
          });
        } else if (messageOrCause.cause) {
          super(message, {
            cause: options?.cause,
            name: constructor.name,
            errorCode: code,
          });
        } else {
          super(message, {
            name: constructor.name,
            errorCode: code,
          });
        }
      }
    };
    // Renaming generated class
    Object.defineProperty(GeneratedClass, 'name', {
      get: () => `${constructor.name}Generated`,
    });

    appExceptionsRegistry.registerException(GeneratedClass);

    return GeneratedClass;
  };
};
