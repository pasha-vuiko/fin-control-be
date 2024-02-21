import { Sex } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { ICustomer } from '@api/customers/interfaces/customer.interface';

export class CustomerEntity implements ICustomer {
  id: string;

  userId: string;

  firstName: string;

  lastName: string;

  email: string;

  birthdate: Date;

  phone: string | null;

  @ApiProperty({ enum: Object.keys(Sex) })
  sex: Sex;

  createdAt: Date;

  updatedAt: Date;
}
