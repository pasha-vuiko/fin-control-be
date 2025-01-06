import { Prettify } from '@shared/types/prettify.type';

export const omitObjKeys = <T extends Record<string, any>, K extends (keyof T)[]>(
  obj: T,
  ...keysToOmit: K
): Prettify<Pick<T, Exclude<keyof T, K[number]>>> => {
  let result = obj;

  for (const key of keysToOmit) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...tempResult } = result;

    result = tempResult as any;
  }

  return result;
};
