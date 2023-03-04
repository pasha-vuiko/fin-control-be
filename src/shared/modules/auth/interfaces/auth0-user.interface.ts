import { Roles } from '@shared/modules/auth/enums/roles';

export const AUTH0_ROLES_KEY = 'https://meta.com/roles';

export interface IAuth0User {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  locale: string;
  updated_at: Date | string;
  email: string;
  email_verified: boolean;
  iss: string;
  sub: string; // user ID
  aud: string;
  iat: number;
  exp: number;
  nonce: string;
  [AUTH0_ROLES_KEY]?: Roles[]; // provide proper key
}
