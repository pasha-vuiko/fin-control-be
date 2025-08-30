import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { PrismaPagination } from '@shared/modules/prisma/interfaces/prisma-pagination.interface';

export function getPrismaPaginationParams(
  pagination: Required<IPagePaginationInput>,
): Required<PrismaPagination> {
  const { page, numOfItems } = pagination;

  return {
    take: numOfItems,
    skip: page * numOfItems,
  };
}
