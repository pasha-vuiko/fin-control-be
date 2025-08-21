/**
 * Copy all Reflect metadata from "from" to "to". Works for both:
 * - function targets (method functions)
 * - (target, propertyKey) pairs (when `propertyKey` is passed)
 */
export function copyMetadata(from: any, to: any, propertyKey?: string | symbol): void {
  if (Reflect === undefined || typeof (Reflect as any).getMetadataKeys !== 'function') {
    return; // reflect-metadata not available; skip
  }

  const getKeys = (Reflect as any).getMetadataKeys as (
    t: any,
    pk?: string | symbol,
  ) => any[];
  const get = (Reflect as any).getMetadata as (
    k: any,
    t: any,
    pk?: string | symbol,
  ) => any;
  const define = (Reflect as any).defineMetadata as (
    k: any,
    v: any,
    t: any,
    pk?: string | symbol,
  ) => void;

  for (const key of getKeys(from, propertyKey)) {
    const value = get(key, from, propertyKey);
    define(key, value, to, propertyKey);
  }
}
