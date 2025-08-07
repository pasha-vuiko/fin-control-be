import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';
import { IAuth0User } from '@shared/modules/auth/interfaces/auth0-user.interface';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser => {
    // eslint-disable-next-line security/detect-object-injection
    const auth0User = ctx.switchToHttp().getRequest()[USER_REQ_PROPERTY];

    if (!auth0User) {
      throw new UnauthorizedException('Failed to get user from request');
    }

    const { sub, name, nickname, given_name, family_name, email, email_verified } =
      auth0User as IAuth0User;

    return {
      id: sub,
      name: name,
      firstName: given_name,
      lastName: family_name,
      nickname,
      email,
      emailVerified: email_verified,
      roles: Auth0Guard.getRolesFromAuth0User(auth0User),
    };
  },
);
