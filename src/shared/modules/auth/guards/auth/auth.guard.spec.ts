import { Reflector } from '@nestjs/core';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(() => {
    const reflector = new Reflector();
    authGuard = new AuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
});
