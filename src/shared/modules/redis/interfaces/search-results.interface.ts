import { ArrayType } from '@shared/types/array.type';

export interface ISearchResults<T extends ArrayType> {
  total: number;
  values: T;
}
