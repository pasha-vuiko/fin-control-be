import { Type } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { ValidateNested } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/ban-types
export function ValidateNestedObj(ObjType: Function): PropertyDecorator {
  return applyDecorators(
    ValidateNested(),
    Type(() => ObjType),
  );
}
