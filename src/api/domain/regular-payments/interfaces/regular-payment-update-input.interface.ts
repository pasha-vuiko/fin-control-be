import { RegularPaymentCreateInput } from '@api/domain/regular-payments/interfaces/regular-payment-create-input.interface';

export interface RegularPaymentUpdateInput extends Partial<RegularPaymentCreateInput> {}
