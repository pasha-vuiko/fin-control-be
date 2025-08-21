import { IRegularPaymentCreateInput } from '@api/domain/regular-payments/interfaces/regular-payment-create-input.interface';

export interface IRegularPaymentUpdateInput extends Partial<IRegularPaymentCreateInput> {}
