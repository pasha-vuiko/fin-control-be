import { Sex } from '@api/customers/enums/sex.enum';

export interface ICustomer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthdate: Date;
  sex: Sex;
  createdAt: Date;
  updatedAt: Date;
}
