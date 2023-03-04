import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';
import { Roles } from '@shared/modules/auth/enums/roles';

export function getRolesFromAuth0User(user: IAuth0User): Roles[] {
  if (user[AUTH0_ROLES_KEY]?.length) {
    return user[AUTH0_ROLES_KEY].map(role => role.toUpperCase() as Roles);
  }

  return [Roles.CUSTOMER];
}
