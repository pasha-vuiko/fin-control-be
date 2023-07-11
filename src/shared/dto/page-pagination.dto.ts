import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { DEFAULT_PAGE_PAGINATION } from '@shared/constants/pagination-defaults';
import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';

export class PagePaginationDto implements IPagePaginationInput {
  @IsNumber()
  @NotRequired()
  @Transform(({ value }) => Number(value))
  numOfItems: number = DEFAULT_PAGE_PAGINATION.numOfItems;

  @IsNumber()
  @NotRequired()
  @Transform(({ value }) => Number(value))
  page: number = DEFAULT_PAGE_PAGINATION.page;
}
