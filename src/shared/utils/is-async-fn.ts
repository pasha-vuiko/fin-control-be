export function isAsyncFn(fn: any): boolean {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}
