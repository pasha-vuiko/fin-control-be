import { isPromise } from 'node:util/types';

import { isFunction } from '@nestjs/common/utils/shared.utils';

import { isAsyncFn } from '@shared/utils/is-async-fn';

/**
 *
 * @param ErrorClassConstructor Class constructor of error to be handled
 * @param handler Error handler function
 * @description Catches method errors of specified error class constructor with
 * handler function,
 * Turns entry method to async even if it wasn't async before
 */
export const CatchTheError = (
  ErrorClassConstructor: (...args: any[]) => any,
  handler: TErrorHandler,
): MethodDecorator => Factory(ErrorClassConstructor, handler);

/**
 *
 * @param handler Error handler function
 * @description Catches method errors and handles them with handler function
 */
export const Catch = (handler: TErrorHandler): MethodDecorator => Factory(handler);

// eslint-disable-next-line max-lines-per-function
function Factory(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ErrorClassConstructor: Function | TErrorHandler,
  handler?: TErrorHandler,
) {
  // eslint-disable-next-line max-lines-per-function
  return (
    _target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const { value: originalFn } = descriptor;

    if (!handler) {
      handler = ErrorClassConstructor as TErrorHandler;
      ErrorClassConstructor = undefined as unknown as any;
    }

    const handleError = (error: any, args: any): any => {
      if (
        isFunction(handler) &&
        (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
      ) {
        //@ts-expect-error handler is possibly undefined
        return handler.call(null, error, this, key, args);
      }

      throw error;
    };

    if (isAsyncFn(originalFn)) {
      descriptor.value = async function (...args: any[]): Promise<any> {
        try {
          const result = originalFn.apply(this, args);

          return isPromise(result) ? await result : await Promise.resolve(result);
        } catch (error) {
          handleError(error, args);
        }
      };

      return descriptor;
    }

    descriptor.value = function (...args: any[]): any {
      try {
        return originalFn.apply(this, args);
      } catch (error) {
        handleError(error, args);
      }
    };

    return descriptor;
  };
}

export type TErrorHandler = (
  err: any,
  methodContext: any,
  methodName?: string,
  methodArgs?: any[],
) => any;
