import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { RegularPaymentCreateInput } from '@api/domain/regular-payments/interfaces/regular-payment-create-input.interface';
import { RegularPaymentFromDb } from '@api/domain/regular-payments/interfaces/regular-payment-from-db.interface';
import { RegularPaymentUpdateInput } from '@api/domain/regular-payments/interfaces/regular-payment-update-input.interface';

export interface IRegularPaymentsRepository {
  findAll(): Promise<RegularPaymentFromDb[]>;

  findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<RegularPaymentFromDb>>;

  findOne(id: string): Promise<RegularPaymentFromDb | null>;

  create(data: RegularPaymentCreateInput): Promise<RegularPaymentFromDb>;

  update(
    id: string,
    data: RegularPaymentUpdateInput,
  ): Promise<RegularPaymentFromDb | null>;

  delete(id: string): Promise<RegularPaymentFromDb | null>;
}

export interface IRegularPaymentsFilter {
  customerId?: string;
}
