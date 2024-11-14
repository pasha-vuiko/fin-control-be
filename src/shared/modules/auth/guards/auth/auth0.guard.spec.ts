import { describe, vitest } from 'vitest';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AuthForbiddenException,
  AuthInvalidTokenException,
} from '@shared/modules/auth/exceptions/exception-classes';
import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { JWTVerifierService } from '@shared/modules/auth/services/jwt-verifier.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import { Auth0Guard } from './auth0.guard';

// Mocks
const mockContext = {
  switchToHttp: () => ({
    getRequest: vitest.fn(),
    getResponse: vitest.fn(),
  }),
  getHandler: vitest.fn(),
} as unknown as ExecutionContext;

const mockReflector = {
  get: vitest.fn(),
} as unknown as Reflector;

// eslint-disable-next-line max-lines-per-function
describe('Auth0Guard', () => {
  let authGuard: Auth0Guard;
  let jwtVerifierService: JWTVerifierService;

  beforeEach(async () => {
    jwtVerifierService = getMockedInstance(JWTVerifierService);
    authGuard = new Auth0Guard(mockReflector, {} as IAuthModuleOptions);
    //@ts-expect-error access to private property
    authGuard.jwtVerifierService = jwtVerifierService;
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  // eslint-disable-next-line max-lines-per-function
  describe('canActivate()', () => {
    it('should allow access when no roles are required', async () => {
      // @ts-expect-error not all methods are implemented
      vitest.spyOn(mockContext, 'switchToHttp').mockReturnValueOnce({
        getRequest: (): any => ({
          user: { [AUTH0_ROLES_KEY]: [Roles.CUSTOMER] },
          headers: {
            authorization: 'Bearer wdfsdffsdfdfsdfsaff',
          },
        }),
        getResponse: (): any => ({}),
      });
      vitest.spyOn(jwtVerifierService, 'verify').mockResolvedValue({});

      expect(await authGuard.canActivate(mockContext)).toBe(true);
    });

    it('should throw UnauthorizedException if authentication fails', async () => {
      // @ts-expect-error not all methods are implemented
      vitest.spyOn(mockContext, 'switchToHttp').mockReturnValueOnce({
        getRequest: (): any => ({
          user: { [AUTH0_ROLES_KEY]: [Roles.CUSTOMER] },
          headers: {
            authorization: 'Bearer wdfsdffsdfdfsdfsaff',
          },
        }),
        getResponse: (): any => ({}),
      });
      vitest.spyOn(jwtVerifierService, 'verify').mockRejectedValue(new Error());

      const resultPromise = authGuard.canActivate(mockContext);

      await expect(resultPromise).rejects.toThrow(AuthInvalidTokenException);
    });

    it('should throw ForbiddenException when user does not have the required roles', async () => {
      // @ts-expect-error not all methods are implemented
      vitest.spyOn(mockContext, 'switchToHttp').mockReturnValueOnce({
        getRequest: (): any => ({
          user: { [AUTH0_ROLES_KEY]: [Roles.CUSTOMER] },
          headers: {
            authorization: 'Bearer wdfsdffsdfdfsdfsaff',
          },
        }),
        getResponse: (): any => ({}),
      });
      vitest.spyOn(jwtVerifierService, 'verify').mockResolvedValue({});
      vitest.spyOn(mockReflector, 'get').mockReturnValueOnce([Roles.ADMIN]);

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        AuthForbiddenException,
      );
    });
  });

  describe('getRolesFromAuth0User()', () => {
    it('should correctly transform user roles from Auth0', () => {
      const user = {
        [AUTH0_ROLES_KEY]: [Roles.ADMIN, Roles.CUSTOMER],
      } as IAuth0User;
      const userRoles = Auth0Guard.getRolesFromAuth0User(user);

      expect(userRoles).toEqual(expect.arrayContaining([Roles.ADMIN, Roles.CUSTOMER]));
    });

    it('should return [Roles.CUSTOMER] if user has no roles', () => {
      const noRolesUser = Auth0Guard.getRolesFromAuth0User({} as IAuth0User);

      expect(noRolesUser).toEqual([Roles.CUSTOMER]);
    });
  });
});
