import { DynamicModule, Module } from '@nestjs/common';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { Auth0Guard } from '@shared/modules/auth/guards/auth/auth0.guard';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { AuthConfigService } from '@shared/modules/auth/services/auth-config.service';

@Module({})
export class AuthModule {
  public static forRoot(options: IAuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useValue: options,
        },
        AuthConfigService,
        Auth0Guard,
      ],
      exports: [AuthConfigService, Auth0Guard],
    };
  }
}
