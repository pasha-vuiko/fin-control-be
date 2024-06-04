import { vi } from 'vitest';

export function getMockedInstance<T, C extends { new (value: T): any }>(
  ClassConstructor: C,
): InstanceType<C> {
  const resultObject: Record<string, any> = {};

  for (const key of Object.keys(
    Object.getOwnPropertyDescriptors(ClassConstructor.prototype),
  )) {
    // eslint-disable-next-line security/detect-object-injection
    resultObject[key] = vi.fn();
  }

  return resultObject as InstanceType<C>;
}
