import { ApiProperty } from '@nestjs/swagger';

export class PagePaginationResEntity<IItem> {
  @ApiProperty()
  items: IItem[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  numOfItems: number;
}
