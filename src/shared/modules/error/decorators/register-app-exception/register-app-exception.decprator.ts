import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import {
  AppException,
  ERR_CODE_HTTP_STATUS_INDEX,
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
  const httpStatusFromCodeStr =
    code.split('.').at(ERR_CODE_HTTP_STATUS_INDEX) ?? 'undefined';
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
  return (Constructor: T): T | void => {
    const instanceForValidation: unknown = new Constructor();
    if (!(instanceForValidation instanceof AppException)) {
      throw new Error('Decorated class should be child of AppException');
    }

    //@ts-expect-error mixing class constructor should have one argument which is any[]
    const GeneratedClass = class extends Constructor {
      constructor(options: IOptionsWithCause);
      constructor(message?: string, options?: IAppExceptionsOptions);
      constructor(
        messageOrCause: string | IOptionsWithCause | undefined,
        options?: IAppExceptionsOptions,
      ) {
        if (typeof messageOrCause === 'string' && typeof options === 'object') {
          super(message, {
            cause: options.cause,
            name: Constructor.name,
            errorCode: code,
          });
        } else if (typeof messageOrCause === 'string') {
          super(messageOrCause, {
            name: Constructor.name,
            errorCode: code,
          });
        } else if (messageOrCause?.cause) {
          super(message, {
            cause: messageOrCause?.cause,
            name: Constructor.name,
            errorCode: code,
          });
        } else {
          super(message, {
            name: Constructor.name,
            errorCode: code,
          });
        }
      }
    };
    // Renaming generated class
    Object.defineProperty(GeneratedClass, 'name', {
      get: () => `${Constructor.name}Generated`,
    });

    appExceptionsRegistry.registerException(GeneratedClass);

    return GeneratedClass;
  };
};
