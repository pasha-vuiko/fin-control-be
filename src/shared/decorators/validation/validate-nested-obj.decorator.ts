import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { applyDecorators } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ValidateNestedObj(ObjType: Function): PropertyDecorator {
  return applyDecorators(
    ValidateNested(),
    Type(() => ObjType),
  );
}
