import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_ROLES_META } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';

@Injectable()
export class Auth0Guard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const reply = httpContext.getResponse();

    await req.authenticate(req, reply).catch((e: Error | any) => {
      throw new UnauthorizedException(`Failed to auth, ${e.message}`, { cause: e });
    });

    const requiredRoles = this.getRequiredRoles(context);
    const userRoles = Auth0Guard.getRolesFromAuth0User(req.user);

    return this.checkRolesMatch(requiredRoles, userRoles);
  }

  private getRequiredRoles(context: ExecutionContext): Roles[] {
    const roles = this.reflector.get<Roles[]>(AUTH_ROLES_META, context.getHandler());

    return roles ?? [];
  }

  private checkRolesMatch(requiredRoles: Roles[], userRoles: Roles[]): true | never {
    if (!requiredRoles.length) {
      return true;
    }

    const rolesMatch = requiredRoles.some(requiredRole =>
      userRoles.includes(requiredRole),
    );

    if (!rolesMatch) {
      throw new ForbiddenException(
        'User does not have permissions to access the resource',
      );
    }

    return rolesMatch;
  }

  public static getRolesFromAuth0User(user: IAuth0User): Roles[] {
    // eslint-disable-next-line security/detect-object-injection
    if (user[AUTH0_ROLES_KEY]?.length) {
      // eslint-disable-next-line security/detect-object-injection
      return user[AUTH0_ROLES_KEY].map(role => role.toUpperCase() as Roles);
    }

    return [Roles.CUSTOMER];
  }
}
