import { Roles } from '@shared/modules/auth/enums/roles';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/modules/auth/guards/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const AUTH_ROLES_META = Symbol('roles');

/**
 *
 * @param roles one of roles should be present to access an endpoint
 * @constructor
 */
export function Auth(...roles: Roles[]): MethodDecorator {
  return applyDecorators(
    SetMetadata<symbol, Roles[]>(AUTH_ROLES_META, roles),
    UseGuards(AuthGuard),
    ApiBearerAuth(),
  );
}
