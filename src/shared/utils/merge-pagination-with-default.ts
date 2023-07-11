import { DEFAULT_PAGE_PAGINATION } from '@shared/constants/pagination-defaults';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';

export function mergePaginationWithDefault(
  pagination?: IPagePaginationInput,
): Required<IPagePaginationInput> {
  if (!pagination) {
    return DEFAULT_PAGE_PAGINATION;
  }

  return {
    ...DEFAULT_PAGE_PAGINATION,
    ...pagination,
  };
}
