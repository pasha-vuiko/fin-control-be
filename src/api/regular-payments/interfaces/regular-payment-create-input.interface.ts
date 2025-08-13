import { InferInsertModel } from 'drizzle-orm';

import { RegularPayment } from '../../../../prisma/drizzle/schema';

type RegularPaymentCreateInput = InferInsertModel<typeof RegularPayment>;

export interface IRegularPaymentCreateInput
  extends Omit<RegularPaymentCreateInput, 'id'> {
  customerId: string;
}
