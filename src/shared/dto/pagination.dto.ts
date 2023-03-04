import { IPrismaPagination } from '@shared/modules/prisma/interfaces/prisma-pagination.interface';
import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { IsNumber } from 'class-validator';

export class PaginationDto implements IPrismaPagination {
  @IsNumber()
  @NotRequired()
  skip?: number;

  @IsNumber()
  @NotRequired()
  take?: number;
}
