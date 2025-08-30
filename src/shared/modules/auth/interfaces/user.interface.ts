import { Roles } from '@shared/modules/auth/enums/roles';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  emailVerified: boolean;
  roles: Roles[];
}
