import { IsEnum } from 'class-validator';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { OrderDirection } from '@shared/types/enums/oreder-direction.enum';

export class OrderParamsDto<SearchEntity> extends PagePaginationDto {
  orderBy: keyof SearchEntity;

  @IsEnum(OrderDirection)
  orderDirection: OrderDirection;
}
