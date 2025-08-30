import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { IRegularPaymentCreateInput } from '@api/domain/regular-payments/interfaces/regular-payment-create-input.interface';
import { IRegularPaymentFromDb } from '@api/domain/regular-payments/interfaces/regular-payment-from-db.interface';
import { IRegularPaymentUpdateInput } from '@api/domain/regular-payments/interfaces/regular-payment-update-input.interface';

export interface IRegularPaymentsRepository {
  findAll(): Promise<IRegularPaymentFromDb[]>;

  findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPaymentFromDb>>;

  findOne(id: string): Promise<IRegularPaymentFromDb | null>;

  create(data: IRegularPaymentCreateInput): Promise<IRegularPaymentFromDb>;

  update(
    id: string,
    data: IRegularPaymentUpdateInput,
  ): Promise<IRegularPaymentFromDb | null>;

  delete(id: string): Promise<IRegularPaymentFromDb | null>;
}

export interface IRegularPaymentsFilter {
  customerId?: string;
}
