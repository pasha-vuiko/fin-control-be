import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { HttpAdapterHost } from '@nestjs/core';
import auth0Authenticate from '@shared/modules/auth/fastify-plugins/auth0-authenticate.plugin';
import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { FastifyAdapter } from '@nestjs/platform-fastify';

@Injectable()
export class AuthConfigService implements OnModuleInit {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS) private authModuleOptions: IAuthModuleOptions,
    private adapterHost: HttpAdapterHost<FastifyAdapter>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.adapterHost.httpAdapter.register(
      //@ts-expect-error type of the plugin is not compatible with the type of the register method
      auth0Authenticate,
      this.authModuleOptions,
    );
  }
}
