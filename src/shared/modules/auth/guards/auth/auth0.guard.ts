import { FastifyRequest } from 'fastify';

import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';
import { AuthRoles } from '@shared/modules/auth/decorators/auth-roles.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AuthExpiredTokenException,
  AuthForbiddenException,
  AuthInvalidTokenException,
} from '@shared/modules/auth/exceptions/exception-classes';
import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { JWTVerifierService } from '@shared/modules/auth/services/jwt-verifier.service';

@Injectable()
export class Auth0Guard implements CanActivate {
  private readonly jwtVerifierService: JWTVerifierService;

  constructor(
    private reflector: Reflector,
    @Inject(AUTH_MODULE_OPTIONS)
    moduleOptions: IAuthModuleOptions,
  ) {
    this.jwtVerifierService = new JWTVerifierService(moduleOptions.domain);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req: FastifyRequest = httpContext.getRequest();
    const authToken = this.getToken(req.headers.authorization);

    const tokenPayload = await this.jwtVerifierService
      .verify(authToken)
      .catch((e: Error | any) => {
        if (e.message.toLowerCase().includes('expired')) {
          throw new AuthExpiredTokenException();
        }

        throw new AuthInvalidTokenException({ cause: e });
      });

    const requiredRoles = this.getRequiredRoles(context);
    const userRoles = Auth0Guard.getRolesFromAuth0User(tokenPayload);

    //@ts-expect-error req[userReqProperty] implicitly has any type
    // eslint-disable-next-line security/detect-object-injection
    req[USER_REQ_PROPERTY] = tokenPayload;

    return this.checkRolesMatch(requiredRoles, userRoles);
  }

  private getToken(authorizationHeader: string | undefined): string {
    const token = authorizationHeader?.split(' ', 2).at(1);

    if (!token) {
      throw new AuthInvalidTokenException();
    }

    return token;
  }

  private getRequiredRoles(context: ExecutionContext): Roles[] {
    const roles =
      this.reflector.get(AuthRoles, context.getHandler()) ??
      this.reflector.get(AuthRoles, context.getClass());

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
      throw new AuthForbiddenException();
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
