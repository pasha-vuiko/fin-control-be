import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';

export function getDbPaginationParams(
  pagination: Required<IPagePaginationInput>,
): Required<Pagination> {
  const { page, numOfItems } = pagination;

  return {
    take: numOfItems,
    skip: page * numOfItems,
  };
}

export interface Pagination {
  take: number;
  skip: number;
}
