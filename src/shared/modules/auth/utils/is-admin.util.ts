import { Roles } from '@shared/modules/auth/enums/roles';
import { User } from '@shared/modules/auth/interfaces/user.interface';

export function isAdmin(user: User): boolean {
  return user.roles.includes(Roles.ADMIN);
}
