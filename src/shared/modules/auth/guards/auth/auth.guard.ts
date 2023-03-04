import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Roles } from '@shared/modules/auth/enums/roles';
import { AUTH_ROLES_META } from '@shared/modules/auth/decorators/auth.decorator';
import { Reflector } from '@nestjs/core';
import { getRolesFromAuth0User } from '@shared/modules/auth/utils/getRolesFromAuth0User';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const reply = context.switchToHttp().getResponse();

    await req.authenticate(req, reply).catch((e: Error | any) => {
      throw new UnauthorizedException('Failed to auth via Auth0', e);
    });

    const requiredRoles = this.getRequiredRoles(context);
    const userRoles = getRolesFromAuth0User(req.user);

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
}
