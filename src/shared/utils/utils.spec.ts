import { describe } from 'vitest';

import { FilterUndefined } from '@shared/types/filter-undefined.type';
import { deleteUndefinedFieldsFromObj } from '@shared/utils/delete-undefined-fields-from-obj.util';

// eslint-disable-next-line max-lines-per-function
describe('Utils', () => {
  // eslint-disable-next-line max-lines-per-function
  describe('deleteUndefinedFieldsFromObj', () => {
    it('should remove keys with undefined values', () => {
      const input = {
        a: undefined,
        b: 'test',
        c: undefined,
        d: undefined,
        e: 42,
      };

      const expectedOutput: FilterUndefined<typeof input> = {
        b: 'test',
        e: 42,
      };

      const result = deleteUndefinedFieldsFromObj(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should return an empty object if all values are undefined', () => {
      const input = {
        a: undefined,
        b: undefined,
        c: undefined,
        d: undefined,
        e: undefined,
      };

      const expectedOutput: FilterUndefined<typeof input> = {};

      const result = deleteUndefinedFieldsFromObj(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should return the same object if no values are undefined', () => {
      const input = {
        a: 1,
        b: 'test',
        c: 2, // Ensuring c is not undefined for the test
        d: true,
        e: 42,
      };

      const expectedOutput: FilterUndefined<typeof input> = {
        a: 1,
        b: 'test',
        c: 2,
        d: true,
        e: 42,
      };

      const result = deleteUndefinedFieldsFromObj(input);

      expect(result).toEqual(expectedOutput);
    });
  });
});
