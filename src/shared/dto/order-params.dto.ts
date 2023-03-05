import { PaginationDto } from '@shared/dto/pagination.dto';
import { OrderDirection } from '@shared/types/enums/oreder-direction.enum';
import { IsEnum } from 'class-validator';

export class OrderParamsDto<SearchEntity> extends PaginationDto {
  orderBy: keyof SearchEntity;

  @IsEnum(OrderDirection)
  orderDirection: OrderDirection;
}
