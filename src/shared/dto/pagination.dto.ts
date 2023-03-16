import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { IsNumberString } from 'class-validator';
import { IPagination } from '@shared/interfaces/pagination.interface';
import { DEFAULT_PAGINATION } from '@shared/constants/pagination-defaults';

export class PaginationDto implements IPagination {
  @IsNumberString()
  @NotRequired()
  skip?: number = DEFAULT_PAGINATION.skip;

  @IsNumberString()
  @NotRequired()
  take?: number = DEFAULT_PAGINATION.take;
}
