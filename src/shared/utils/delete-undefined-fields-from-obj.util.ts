import { FilterUndefined } from '@shared/types/filter-undefined.type';

export function deleteUndefinedFieldsFromObj<T extends Record<string, unknown>>(
  obj: T,
): FilterUndefined<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // eslint-disable-next-line security/detect-object-injection
    result[key] = value;
  }

  return result as FilterUndefined<T>;
}
