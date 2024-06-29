export function groupBy<T>(
  items: T[],
  callbackfn: (item: T) => string,
): { [key: string]: T[] } {
  // Step 1: Group items by the key returned from the callback function
  const groups = items.reduce(
    (result, item) => {
      const key = callbackfn(item);
      // eslint-disable-next-line security/detect-object-injection
      if (!result[key]) {
        // eslint-disable-next-line security/detect-object-injection
        result[key] = [];
      }
      // eslint-disable-next-line security/detect-object-injection
      result[key].push(item);
      return result;
    },
    {} as { [key: string]: T[] },
  );

  // Step 2: Create an object with a null prototype
  const obj = Object.create(null) as { [key: string]: T[] };

  // Step 3: Iterate over each group and create a property on the obj
  for (const [key, elements] of Object.entries(groups)) {
    Object.defineProperty(obj, key, {
      value: elements,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  // Step 4: Return the object with grouped properties
  return obj;
}
