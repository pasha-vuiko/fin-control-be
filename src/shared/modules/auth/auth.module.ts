import { DynamicModule, Module } from '@nestjs/common';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { UserAuth0Service } from '@shared/modules/auth/services/user-auth0.service';

@Module({})
export class AuthModule {
  public static forRoot(options: IAuthModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: AUTH_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      global: true,
      module: AuthModule,
      providers: [optionsProvider, Auth0Guard, UserAuth0Service],
      exports: [optionsProvider, Auth0Guard, UserAuth0Service],
    };
  }
}
