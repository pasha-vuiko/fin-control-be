import { DEFAULT_PAGINATION } from '@shared/constants/pagination-defaults';
import { IPagination } from '@shared/interfaces/pagination.interface';

export function mergePaginationWithDefault(pagination?: IPagination): IPagination {
  if (!pagination) {
    return DEFAULT_PAGINATION;
  }

  return {
    ...DEFAULT_PAGINATION,
    ...pagination,
  };
}
