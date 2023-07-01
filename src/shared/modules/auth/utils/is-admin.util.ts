import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';

export function isAdmin(user: IUser): boolean {
  return user.roles.includes(Roles.ADMIN);
}
