import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';
import { IRegularPaymentUpdateInput } from '@api/regular-payments/interfaces/regular-payment-update-input.interface';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';

export interface IRegularPaymentsRepository {
  findAll(): Promise<IRegularPayment[]>;

  findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPayment>>;

  findOne(id: string): Promise<IRegularPayment | null>;

  create(data: IRegularPaymentCreateInput): Promise<IRegularPayment>;

  update(id: string, data: IRegularPaymentUpdateInput): Promise<IRegularPayment>;

  delete(id: string): Promise<IRegularPayment>;
}

export interface IRegularPaymentsFilter {
  customerId?: string;
}
