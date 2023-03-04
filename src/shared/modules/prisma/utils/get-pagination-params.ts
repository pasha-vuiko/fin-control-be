import { IPrismaPagination } from '@shared/modules/prisma/interfaces/prisma-pagination.interface';

export function getPaginationParams(skip?: number, take?: number): IPrismaPagination {
  const pagination: IPrismaPagination = {};

  if (skip) {
    pagination.skip = skip;
  }

  if (take) {
    pagination.take = take;
  }

  return pagination;
}
