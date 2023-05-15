import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

import { IAuth0User } from '@shared/modules/auth/interfaces/auth0-user.interface';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { getRolesFromAuth0User } from '@shared/modules/auth/utils/getRolesFromAuth0User';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser => {
    const { user: auth0User } = ctx.switchToHttp().getRequest();

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
      nickname: nickname,
      email: email,
      emailVerified: email_verified,
      roles: getRolesFromAuth0User(auth0User),
    };
  },
);
