import { vi } from 'vitest';

import { TConstructor } from '@shared/types/constructor.type';

const cache = new Map<TConstructor, InstanceType<any>>();
/**
 * Creates object from input class which properties is mocked with vi.fn()
 *
 * @param ClassConstructor - The class constructor which properties will be mocked
 */
export function getMockedInstance<C extends TConstructor>(
  ClassConstructor: C,
): InstanceType<C> {
  const cached = cache.get(ClassConstructor);

  if (cached) {
    // return cloned object to avoid shared state
    return { ...cached };
  }

  const mockedInstance: Record<string, any> = {};

  const allPropertyDescriptorNames = getAllPropertyDescriptorNames(ClassConstructor);

  for (const descriptorName of allPropertyDescriptorNames) {
    // eslint-disable-next-line security/detect-object-injection
    mockedInstance[descriptorName] = vi.fn();
  }

  cache.set(ClassConstructor, mockedInstance);

  return mockedInstance as InstanceType<C>;
}

/**
 * Retrieves all property descriptor names of a class, including inherited properties
 * but excluding properties of the Object prototype.
 *
 * @param ClassConstructor - The class constructor from which to retrieve property descriptors.
 * @returns An object containing all property descriptors.
 */
function getAllPropertyDescriptorNames<T>(ClassConstructor: TConstructor<T>): string[] {
  // Initialize an empty object to hold the property descriptors
  const descriptorsNames = new Set<string>();

  // Start with the prototype of the class
  let proto = ClassConstructor.prototype;

  // Iterate through the prototype chain until reaching Object.prototype
  while (proto && proto !== Object.prototype) {
    // Get all own property names of the current prototype
    for (const name of Object.getOwnPropertyNames(proto)) {
      // If the property is not already in the descriptors object, add it
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);

      if (descriptor) {
        descriptorsNames.add(name);
      }
    }

    // Move up the prototype chain
    proto = Object.getPrototypeOf(proto);
  }

  return [...descriptorsNames];
}
