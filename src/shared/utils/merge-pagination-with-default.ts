import { IPagination } from '@shared/interfaces/pagination.interface';
import { DEFAULT_PAGINATION } from '@shared/constants/pagination-defaults';

export function mergePaginationWithDefault(pagination?: IPagination): IPagination {
  if (!pagination) {
    return DEFAULT_PAGINATION;
  }

  return {
    ...DEFAULT_PAGINATION,
    ...pagination,
  };
}
