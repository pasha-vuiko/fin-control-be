import {
  IsDateString,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { NotRequired } from '@shared/decorators/validation/not-required.decorator';

import { Sex } from '@api/customers/enums/sex.enum';
import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';

export class CustomerCreateDto
  implements Omit<ICustomerCreateInput, 'id' | 'userId' | 'email' | 'birthdate'>
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
