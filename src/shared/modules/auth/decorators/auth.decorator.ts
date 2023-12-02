import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '@shared/modules/auth/enums/roles';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';

export const AUTH_ROLES_META = Symbol('roles');

/**
 *
 * @param roles one of roles should be present to access an endpoint
 * @constructor
 */
export function Auth(...roles: Roles[]): MethodDecorator {
  return applyDecorators(
    SetMetadata<symbol, Roles[]>(AUTH_ROLES_META, roles),
    UseGuards(Auth0Guard),
    ApiBearerAuth(),
  );
}
