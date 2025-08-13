import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthRoles } from '@shared/modules/auth/decorators/auth-roles.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AuthExpiredTokenException,
  AuthForbiddenException,
  AuthInvalidTokenException,
} from '@shared/modules/auth/exceptions/exception-classes';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';
import { ApiAppExceptionsRes } from '@shared/modules/error/open-api/api-app-exceptions-response.decorator';

/**
 *
 * @param roles one of roles should be present to access an endpoint
 * @constructor
 */
export function Auth(...roles: Roles[]): MethodDecorator & ClassDecorator {
  return applyDecorators(
    AuthRoles(roles),
    UseGuards(Auth0Guard),
    ApiBearerAuth(),
    ApiAppExceptionsRes(
      AuthInvalidTokenException,
      AuthExpiredTokenException,
      AuthForbiddenException,
    ),
  );
}
