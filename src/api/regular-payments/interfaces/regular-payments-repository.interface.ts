import { IPagination } from '@shared/interfaces/pagination.interface';

import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';
import { IRegularPaymentUpdateInput } from '@api/regular-payments/interfaces/regular-payment-update-input.interface';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';

export interface IRegularPaymentsRepository {
  findMany(
    filter: IRegularPaymentsFilter,
    pagination?: IPagination,
  ): Promise<IRegularPayment[]>;

  findOne(id: string): Promise<IRegularPayment | null>;

  create(data: IRegularPaymentCreateInput): Promise<IRegularPayment>;

  update(id: string, data: IRegularPaymentUpdateInput): Promise<IRegularPayment>;

  delete(id: string): Promise<IRegularPayment>;
}

export interface IRegularPaymentsFilter {
  customerId?: string;
}
