import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { DEFAULT_PAGINATION } from '@shared/constants/pagination-defaults';
import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { IPagination } from '@shared/interfaces/pagination.interface';

export class PaginationDto implements IPagination {
  @IsNumber()
  @NotRequired()
  @Transform(({ value }) => Number(value))
  skip?: number = DEFAULT_PAGINATION.skip;

  @IsNumber()
  @NotRequired()
  @Transform(({ value }) => Number(value))
  take?: number = DEFAULT_PAGINATION.take;
}
