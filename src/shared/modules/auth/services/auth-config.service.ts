import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import userReqPropertyPlugin from '@shared/modules/auth/fastify-plugins/user-req-property.plugin';
import { AuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';

@Injectable()
export class AuthConfigService implements OnModuleInit {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
    private readonly adapterHost: HttpAdapterHost<FastifyAdapter>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.adapterHost.httpAdapter.register(
      //@ts-expect-error type of the plugin is not compatible with the type of the register method
      userReqPropertyPlugin,
    );
  }
}
