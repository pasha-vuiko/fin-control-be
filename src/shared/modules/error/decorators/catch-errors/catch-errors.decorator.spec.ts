import { describe } from 'vitest';

import {
  CatchErrors,
  CatchTheError,
  TErrorHandler,
} from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';

// eslint-disable-next-line max-lines-per-function
describe('CatchErrors decorators', () => {
  // eslint-disable-next-line max-lines-per-function
  describe('@CatchTheError()', () => {
    it('should catch specified error and handle it', async () => {
      class CustomError extends Error {}

      const handler: TErrorHandler = vi.fn();
      const errorToThrow = new CustomError('Test error');

      class TestClass {
        @CatchTheError(CustomError, handler)
        async errorProneMethod(): Promise<void> {
          throw errorToThrow;
        }
      }

      const instance = new TestClass();

      await instance.errorProneMethod();

      expect(handler).toHaveBeenCalledWith(
        errorToThrow,
        instance,
        'errorProneMethod',
        [],
      );
    });

    it('should rethrow error if it is not of specified type', async () => {
      class CustomError extends Error {}
      class AnotherError extends Error {}

      const handler: TErrorHandler = vi.fn();

      class TestClass {
        @CatchTheError(CustomError, handler)
        async errorProneMethod(): Promise<void> {
          throw new AnotherError('Test error');
        }
      }

      const instance = new TestClass();

      await expect(instance.errorProneMethod()).rejects.toThrow(AnotherError);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('@CatchErrors()', () => {
    it('should catch any error and handle it', async () => {
      const handler: TErrorHandler = vi.fn();
      const errorToThrow = new Error('Test error');

      class TestClass {
        @CatchErrors(handler)
        async errorProneMethod(): Promise<void> {
          throw errorToThrow;
        }
      }

      const instance = new TestClass();

      await instance.errorProneMethod();

      expect(handler).toHaveBeenCalledWith(
        errorToThrow,
        instance,
        'errorProneMethod',
        [],
      );
    });

    it('should catch synchronous exceptions and handle them', () => {
      const handler: TErrorHandler = vi.fn();
      const errorToThrow = new Error('Test error');

      class TestClass {
        @CatchErrors(handler)
        errorProneMethod(): void {
          throw errorToThrow;
        }
      }

      const instance = new TestClass();

      expect(() => instance.errorProneMethod()).not.toThrow();
      expect(handler).toHaveBeenCalledWith(
        errorToThrow,
        instance,
        'errorProneMethod',
        [],
      );
    });
  });
});
