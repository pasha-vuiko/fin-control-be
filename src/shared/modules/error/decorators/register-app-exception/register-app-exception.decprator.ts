import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import {
  AppException,
  ERR_CODE_HTTP_STATUS_INDEX,
  IAppExceptionsOptions,
  IOptionsWithCause,
  TAppErrorCode,
} from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { TConstructor } from '@shared/types/constructor.type';

/**
 * Decorator that registers an {@link AppException}-derived class in the global {@link appExceptionsRegistry}.
 *
 * Use it on a custom exception class to:
 *  - set a fixed error code (e.g., `"1.404.0"`)
 *  - inject a default message
 *  - auto-register the class in the registry on definition
 *
 * @template T extends new (...args: any[]) => AppException
 * @param {TAppErrorCode} code - A dot-separated error code in the form `FLOW.HTTP.SEQ`.
 *   The second part must be a valid HTTP status (400–599).
 * @param {string} message - Default message used when an instance is constructed without an explicit message.
 *
 * @remarks
 * - The decorated class must extend {@link AppException}.
 * - The generated class name is suffixed with `Generated` for clarity in stack traces.
 * - Supported constructor overloads for the decorated class instances:
 *   1. (options: {@link IOptionsWithCause})
 *   2. (message?: string, options?: {@link IAppExceptionsOptions})
 *
 * @throws {Error} If the HTTP code segment of error-code is not a number or is outside 400–599.
 * @throws {Error} If the decorated class does not extend {@link AppException}.
 *
 * @see appExceptionsRegistry.registerException
 * @see AppException
 *
 * @example
 * ```ts
 * @RegisterAppException('1.404.0', 'User not found')
 * class UserNotFoundException extends AppException {}
 *
 * // Uses default message and code '1.404.0'
 * throw new UserNotFoundException();
 * ```
 *
 * @example
 * ```ts
 * // With a custom message and cause
 * throw new UserNotFoundException('No user with id', { cause: err });
 * ```
 */
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
    if (!(Constructor.prototype instanceof AppException)) {
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
    // Renaming a generated class
    Object.defineProperty(GeneratedClass, 'name', {
      get: () => `${Constructor.name}Generated`,
    });

    appExceptionsRegistry.registerException(GeneratedClass);

    return GeneratedClass;
  };
};
