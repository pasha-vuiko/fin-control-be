import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { IsNumber } from 'class-validator';
import { IPagination } from '@shared/interfaces/pagination.interface';
import { DEFAULT_PAGINATION } from '@shared/constants/pagination-defaults';
import { Transform } from 'class-transformer';

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
