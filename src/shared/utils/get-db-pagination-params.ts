import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPrismaPagination } from '@shared/modules/prisma/interfaces/prisma-pagination.interface';

export function getDbPaginationParams(
  pagination: Required<IPagePaginationInput>,
): Required<IPrismaPagination> {
  const { page, numOfItems } = pagination;

  return {
    take: numOfItems,
    skip: page * numOfItems,
  };
}
