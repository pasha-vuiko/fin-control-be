export interface IUnaryFunction<T, R> {
  (source: T): R;
}

export function pipe<T>(input: T): T;
export function pipe<T, A>(input: T, fn1: IUnaryFunction<T, A>): A;
export function pipe<T, A, B>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
): B;
export function pipe<T, A, B, C>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
): C;
export function pipe<T, A, B, C, D>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
  fn4: IUnaryFunction<C, D>,
): D;
export function pipe<T, A, B, C, D, E>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
  fn4: IUnaryFunction<C, D>,
  fn5: IUnaryFunction<D, E>,
): E;
export function pipe<T, A, B, C, D, E, F>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
  fn4: IUnaryFunction<C, D>,
  fn5: IUnaryFunction<D, E>,
  fn6: IUnaryFunction<E, F>,
): F;
export function pipe<T, A, B, C, D, E, F, G>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
  fn4: IUnaryFunction<C, D>,
  fn5: IUnaryFunction<D, E>,
  fn6: IUnaryFunction<E, F>,
  fn7: IUnaryFunction<F, G>,
): G;
export function pipe<T, A, B, C, D, E, F, G, H>(
  input: T,
  fn1: IUnaryFunction<T, A>,
  fn2: IUnaryFunction<A, B>,
  fn3: IUnaryFunction<B, C>,
  fn4: IUnaryFunction<C, D>,
  fn5: IUnaryFunction<D, E>,
  fn6: IUnaryFunction<E, F>,
  fn7: IUnaryFunction<F, G>,
  fn8: IUnaryFunction<G, H>,
): H;
/**
 *
 * @param input Input value for pipelining
 * @param fns Pipelining functions
 * @description Pipelines input value with pipelining functions
 */
export function pipe(input: any, ...fns: IUnaryFunction<any, any>[]): any {
  if (!fns.length) {
    return input;
  }

  return fns.reduce((arg: any, fn: IUnaryFunction<any, any>) => fn(arg), input);
}
