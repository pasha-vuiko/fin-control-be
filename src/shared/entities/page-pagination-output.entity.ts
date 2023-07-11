import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

export class PagePaginationOutputEntity<IItem> implements IPagePaginationOutput<IItem> {
  items: IItem[];
  total: number;
}
