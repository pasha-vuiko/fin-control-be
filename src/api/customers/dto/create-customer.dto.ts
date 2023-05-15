import {
  IsDateString,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { NotRequired } from '@shared/decorators/validation/not-required.decorator';

import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';

import { Sex } from '../../../../prisma/client';

export class CreateCustomerDto
  implements Omit<ICreateCustomerInput, 'id' | 'userId' | 'email'>
{
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsDateString()
  birthdate: string;

  @NotRequired()
  @IsMobilePhone()
  phone: string | null;

  @ApiProperty({ enum: Object.keys(Sex) })
  @IsNotEmpty()
  @IsEnum(Sex)
  sex: Sex;
}
