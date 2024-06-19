import { Sex } from '@api/customers/enums/sex.enum';

export interface ICustomerCreateInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthdate: string;
  sex: Sex;
}
