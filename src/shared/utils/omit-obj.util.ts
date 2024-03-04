export const omitObj = <T extends Record<string, any>, K extends (keyof T)[]>(
  obj: T,
  ...keysToOmit: K
): Pick<T, Exclude<keyof T, K[number]>> => {
  let result = obj;

  for (const key of keysToOmit) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...tempResult } = result;

    result = tempResult as any;
  }

  return result;
};
