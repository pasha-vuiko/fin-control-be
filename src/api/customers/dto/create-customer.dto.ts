import { Sex } from '../../../../prisma/client';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import {
  IsDateString,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { NotRequired } from '@shared/decorators/validation/not-required.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto
  implements Omit<ICreateCustomerInput, 'id' | 'auth0Id' | 'email'>
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
