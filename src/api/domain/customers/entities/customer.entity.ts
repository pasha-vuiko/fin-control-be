import { Sex } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { ClassFields } from '@shared/types/exclude-methods.type';
import { Prettify } from '@shared/types/prettify.type';

export class CustomerEntity {
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

  constructor(data: Prettify<ClassFields<CustomerEntity>>) {
    this.id = data.id;
    this.userId = data.userId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.birthdate = data.birthdate;
    this.phone = data.phone;
    this.sex = data.sex;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static fromCustomerObj(
    data: Prettify<ClassFields<CustomerEntity>>,
  ): CustomerEntity {
    return new CustomerEntity({
      id: data.id,
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthdate: data.birthdate,
      phone: data.phone,
      sex: data.sex,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    });
  }
}
