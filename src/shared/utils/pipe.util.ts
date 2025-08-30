export interface UnaryFunction<T, R> {
  (source: T): R;
}

export function pipe<T>(input: T): T;
export function pipe<T, A>(input: T, fn1: UnaryFunction<T, A>): A;
export function pipe<T, A, B>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
): B;
export function pipe<T, A, B, C>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
): C;
export function pipe<T, A, B, C, D>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
): D;
export function pipe<T, A, B, C, D, E>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
): E;
export function pipe<T, A, B, C, D, E, F>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
): F;
export function pipe<T, A, B, C, D, E, F, G>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
): G;
export function pipe<T, A, B, C, D, E, F, G, H>(
  input: T,
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
): H;
/**
 *
 * @param input Input value for pipelining
 * @param fns Pipelining functions
 * @description Pipelines input value with pipelining functions
 */
export function pipe(input: any, ...fns: UnaryFunction<any, any>[]): any {
  if (!fns.length) {
    return input;
  }

  return fns.reduce((arg: any, fn: UnaryFunction<any, any>) => fn(arg), input);
}
