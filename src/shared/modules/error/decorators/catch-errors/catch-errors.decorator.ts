import { isPromise } from 'node:util/types';

import { isFunction } from '@nestjs/common/utils/shared.utils';

import { TConstructor } from '@shared/types/constructor.type';
import { copyMetadata } from '@shared/utils/copy-metadata.util';
import { isAsyncFn } from '@shared/utils/is-async-fn';

/**
 *
 * @param ErrorClassConstructor Class constructor of error to be handled
 * @param handler Error handler function
 * @description Catches method exceptions to specified error class constructor with
 * handler function,
 * Turns entry method to async even if it wasn't async before
 */
export const CatchTheError = (
  ErrorClassConstructor: TConstructor,
  handler: TErrorHandler,
): MethodDecorator => Factory(handler, ErrorClassConstructor);

/**
 *
 * @param handler Error handler function
 * @description Catches method exceptions and handles them with handler function
 */
export const CatchErrors = (handler: TErrorHandler): MethodDecorator => Factory(handler);

// eslint-disable-next-line max-lines-per-function
function Factory(
  handler: TErrorHandler,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ErrorClassConstructor?: Function | TErrorHandler,
): MethodDecorator {
  // eslint-disable-next-line max-lines-per-function
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const { value: originalFn } = descriptor;

    const handleError = (error: any, args: any): any => {
      if (
        isFunction(handler) &&
        (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
      ) {
        //@ts-expect-error not assignable type of key
        return handler(error, target, key, args);
      }

      throw error;
    };

    if (isAsyncFn(originalFn)) {
      descriptor.value = async function (...args: any[]): Promise<any> {
        try {
          const result = originalFn.apply(this, args);

          return await Promise.try(() => result);
        } catch (error) {
          return handleError(error, args);
        }
      };
    } else {
      descriptor.value = function (...args: any[]): any {
        try {
          const result = originalFn.apply(this, args);

          return isPromise(result) ? result.catch(err => handleError(err, args)) : result;
        } catch (error) {
          return handleError(error, args);
        }
      };
    }

    // --- Preserve metadata on the bound function (function target) ---
    // Copy metadata that might have been set directly on the original method function
    copyMetadata(originalFn, descriptor.value);

    return descriptor;
  };
}

export type TErrorHandler = (
  err: any,
  methodContext: any,
  methodName?: string,
  methodArgs?: any[],
) => any;
