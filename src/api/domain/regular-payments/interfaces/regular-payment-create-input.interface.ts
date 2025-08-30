import { InferInsertModel } from 'drizzle-orm';

import { RegularPayment } from '../../../../../prisma/drizzle/schema';

type RegularPaymentInsertModel = InferInsertModel<typeof RegularPayment>;

export interface RegularPaymentCreateInput extends Omit<RegularPaymentInsertModel, 'id'> {
  customerId: string;
}
