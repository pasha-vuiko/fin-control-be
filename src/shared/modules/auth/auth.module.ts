import { DynamicModule, Module } from '@nestjs/common';
import { AuthGuard } from '@shared/modules/auth/guards/auth/auth.guard';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { AuthConfigService } from '@shared/modules/auth/services/auth-config.service';
import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';

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
        AuthGuard,
      ],
      exports: [AuthConfigService, AuthGuard],
    };
  }
}
