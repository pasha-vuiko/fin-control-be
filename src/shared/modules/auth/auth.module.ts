import { DynamicModule, Module } from '@nestjs/common';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';
import { AuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';

@Module({})
export class AuthModule {
  public static forRoot(options: AuthModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: AUTH_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      global: true,
      module: AuthModule,
      providers: [optionsProvider, Auth0Guard],
      exports: [optionsProvider, Auth0Guard],
    };
  }
}
