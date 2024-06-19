import { vi } from 'vitest';

import { TConstructor } from '@shared/types/constructor.type';

/**
 * Creates object from input class which properties is mocked with vi.fn()
 *
 * @param ClassConstructor - The class constructor which properties will be mocked
 */
export function getMockedInstance<C extends TConstructor>(
  ClassConstructor: C,
): InstanceType<C> {
  const mockedInstance: Record<string, any> = {};

  for (const key in getAllPropertyDescriptors(ClassConstructor)) {
    // eslint-disable-next-line security/detect-object-injection
    mockedInstance[key] = vi.fn();
  }

  return mockedInstance as InstanceType<C>;
}

/**
 * Retrieves all property descriptors of a class, including inherited properties
 * but excluding properties of the Object prototype.
 *
 * @param ClassConstructor - The class constructor from which to retrieve property descriptors.
 * @returns An object containing all property descriptors.
 */
function getAllPropertyDescriptors<T>(ClassConstructor: new (...args: any[]) => T): {
  [key: string]: PropertyDescriptor;
} {
  // Initialize an empty object to hold the property descriptors
  const descriptors: { [key: string]: PropertyDescriptor } = {};

  // Start with the prototype of the class
  let proto = ClassConstructor.prototype;

  // Iterate through the prototype chain until reaching Object.prototype
  while (proto && proto !== Object.prototype) {
    // Get all own property names of the current prototype
    for (const name of Object.getOwnPropertyNames(proto)) {
      // If the property is not already in the descriptors object, add it
      // eslint-disable-next-line security/detect-object-injection
      if (!descriptors[name]) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (descriptor) {
          // eslint-disable-next-line security/detect-object-injection
          descriptors[name] = descriptor;
        }
      }
    }

    // Move up the prototype chain
    proto = Object.getPrototypeOf(proto);
  }

  return descriptors;
}
