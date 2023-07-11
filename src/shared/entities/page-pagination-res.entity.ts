import { ApiProperty } from '@nestjs/swagger';

export class PagePaginationResEntity<IItem> {
  items: IItem[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  numOfItems: number;
}
