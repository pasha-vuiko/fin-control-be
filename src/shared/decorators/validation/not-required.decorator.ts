import { ValidateIf } from 'class-validator';

import { applyDecorators } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ApiProperty } from '@nestjs/swagger';

export function NotRequired(): PropertyDecorator {
  return applyDecorators(
    ValidateIf((_object, value) => !isNil(value)),
    ApiProperty({ required: false }),
  );
}
