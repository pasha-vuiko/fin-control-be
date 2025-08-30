import { Sex } from '@prisma/client';

export interface CustomerFromDb {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: Date;
  phone: string | null;
  sex: Sex;
  createdAt: Date;
  updatedAt: Date;
}
