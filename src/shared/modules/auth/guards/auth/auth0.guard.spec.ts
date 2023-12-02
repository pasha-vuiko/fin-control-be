import { Reflector } from '@nestjs/core';

import { Auth0Guard } from './auth0.guard';

describe('Auth0Guard', () => {
  let authGuard: Auth0Guard;

  beforeEach(() => {
    const reflector = new Reflector();
    authGuard = new Auth0Guard(reflector);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
});
