import { describe, vitest } from 'vitest';

import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { Roles } from '@shared/modules/auth/enums/roles';
import {
  AUTH0_ROLES_KEY,
  IAuth0User,
} from '@shared/modules/auth/interfaces/auth0-user.interface';

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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        Auth0Guard,
        {
          provide: Reflector,
          useValue: { get: vitest.fn() },
        },
      ],
    }).compile();

    authGuard = moduleRef.get<Auth0Guard>(Auth0Guard);
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
          authenticate: vitest.fn().mockResolvedValue(true),
        }),
        getResponse: (): any => ({}),
      });

      authGuard = new Auth0Guard(mockReflector);

      expect(await authGuard.canActivate(mockContext)).toBe(true);
    });

    it('should throw UnauthorizedException if authentication fails', async () => {
      // @ts-expect-error not all methods are implemented
      vitest.spyOn(mockContext, 'switchToHttp').mockReturnValueOnce({
        getRequest: (): any => ({
          user: { [AUTH0_ROLES_KEY]: [Roles.CUSTOMER] },
          authenticate: vitest.fn().mockRejectedValue(new Error('Auth failed')),
        }),
        getResponse: (): any => ({}),
      });

      authGuard = new Auth0Guard(new Reflector());

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when user does not have the required roles', async () => {
      // @ts-expect-error not all methods are implemented
      vitest.spyOn(mockContext, 'switchToHttp').mockReturnValueOnce({
        getRequest: (): any => ({
          user: { [AUTH0_ROLES_KEY]: [Roles.CUSTOMER] },
          authenticate: vitest.fn().mockResolvedValue(true),
        }),
        getResponse: (): any => ({}),
      });
      vitest.spyOn(mockReflector, 'get').mockReturnValueOnce([Roles.ADMIN]);

      authGuard = new Auth0Guard(mockReflector);

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
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
