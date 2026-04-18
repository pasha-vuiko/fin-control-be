import { describe, expect, it } from 'vitest';

import { rethrowError } from './rethrow-error.util';

class FooError extends Error {}
class BarError extends Error {}
class BazError extends Error {}

// eslint-disable-next-line max-lines-per-function
describe('rethrowError util', () => {
  it('rethrows mapped error with cause when match is found', () => {
    const initial = new FooError('original');

    try {
      rethrowError(initial).when(FooError).throw(BarError, 'wrapped').run();
    } catch (err) {
      expect(err).toBeInstanceOf(BarError);
      expect((err as Error).message).toBe('wrapped');
      expect((err as Error).cause).toBe(initial);
      return;
    }

    throw new Error('Expected error to be thrown');
  });

  it('rethrows provided error instance when match is found', () => {
    const initial = new BarError('original');
    const custom = new BazError('custom');

    try {
      rethrowError(initial).when(BarError).throw(custom).run();
    } catch (err) {
      expect(err).toBe(custom);
      expect((err as Error).cause).toBe(initial);
      return;
    }

    throw new Error('Expected error to be thrown');
  });

  it('throws original when no mapping matches', () => {
    const initial = new FooError('original');

    try {
      rethrowError(initial).when(BarError).throw(BazError).run();
    } catch (err) {
      expect(err).toBe(initial);
      return;
    }

    throw new Error('Expected error to be thrown');
  });
});
