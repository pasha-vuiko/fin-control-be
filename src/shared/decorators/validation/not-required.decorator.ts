import { ValidateIf } from 'class-validator';
import { isNil } from '@nestjs/common/utils/shared.utils';

export function NotRequired(): PropertyDecorator {
  return ValidateIf((_object, value) => !isNil(value));
}
