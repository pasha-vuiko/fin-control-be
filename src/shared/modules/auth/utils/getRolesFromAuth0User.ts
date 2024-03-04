import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';

export function getRolesFromAuth0User(user: IAuth0User): Roles[] {
  // eslint-disable-next-line security/detect-object-injection
  if (user[AUTH0_ROLES_KEY]?.length) {
    // eslint-disable-next-line security/detect-object-injection
    return user[AUTH0_ROLES_KEY].map(role => role.toUpperCase() as Roles);
  }

  return [Roles.CUSTOMER];
}
