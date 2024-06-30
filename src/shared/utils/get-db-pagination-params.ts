import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';

export function getDbPaginationParams(
  pagination: Required<IPagePaginationInput>,
): Required<IPagination> {
  const { page, numOfItems } = pagination;

  return {
    take: numOfItems,
    skip: page * numOfItems,
  };
}

export interface IPagination {
  take: number;
  skip: number;
}
