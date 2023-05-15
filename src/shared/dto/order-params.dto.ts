import { IsEnum } from 'class-validator';

import { PaginationDto } from '@shared/dto/pagination.dto';
import { OrderDirection } from '@shared/types/enums/oreder-direction.enum';

export class OrderParamsDto<SearchEntity> extends PaginationDto {
  orderBy: keyof SearchEntity;

  @IsEnum(OrderDirection)
  orderDirection: OrderDirection;
}
