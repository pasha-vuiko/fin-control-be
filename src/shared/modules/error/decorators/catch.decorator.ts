import { isPromise } from 'node:util/types';
import { isFunction } from '@nestjs/common/utils/shared.utils';

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
  handler: ErrHandler,
): MethodDecorator => Factory(ErrorClassConstructor, handler);

/**
 *
 * @param handler Error handler function
 * @description Catches method errors and handles them with handler function,
 * Turns entry method to async even if it wasn't async before
 */
export const Catch = (handler: ErrHandler): MethodDecorator => Factory(handler);

function Factory(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ErrorClassConstructor: Function | ErrHandler,
  handler?: ErrHandler,
) {
  return (
    _target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const { value: originalFn } = descriptor;

    if (!handler) {
      handler = ErrorClassConstructor as ErrHandler;
      ErrorClassConstructor = undefined as unknown as any;
    }

    descriptor.value = async function (...args: any[]): Promise<any> {
      try {
        const result = originalFn.apply(this, args);

        return isPromise(result) ? await result : await Promise.resolve(result);
      } catch (error) {
        if (
          isFunction(handler) &&
          (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
        ) {
          //@ts-expect-error handler is possibly undefined
          return handler.call(null, error, this, key, args);
        }

        throw error;
      }
    };

    return descriptor;
  };
}

export type ErrHandler = (
  err: any,
  methodContext: any,
  methodName?: string,
  methodArgs?: any[],
) => any;
