import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';

export interface IRegularPaymentUpdateInput extends Partial<IRegularPaymentCreateInput> {}
