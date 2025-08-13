import { Reflector } from '@nestjs/core';

import { Roles } from '@shared/modules/auth/enums/roles';

export const AuthRoles = Reflector.createDecorator<Roles[]>();
