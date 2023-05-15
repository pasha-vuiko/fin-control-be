import { Transform } from 'class-transformer';
import { IsDecimal } from 'class-validator';

import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function IsDecimalNum(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: Number, format: 'decimal' }),
    Transform(({ value }) => {
      if (typeof value === 'number') {
        return value.toString();
      }

      return value;
    }),
    IsDecimal(),
  );
}
