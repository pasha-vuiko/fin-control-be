import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';

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
