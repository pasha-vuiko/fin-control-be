import { ManagementClient } from 'auth0';

import { Inject, Injectable } from '@nestjs/common';

import { AUTH_MODULE_OPTIONS } from '@shared/modules/auth/constants/auth-module-opts-injection-token';
import { UserEmailUpdateException } from '@shared/modules/auth/exceptions/exception-classes';
import { IAuthModuleOptions } from '@shared/modules/auth/interfaces/auth-module-options.interface';
import { IUserService } from '@shared/modules/auth/interfaces/user-service.interface';

@Injectable()
export class UserAuth0Service implements IUserService {
  private readonly auth0Client: ManagementClient;

  constructor(@Inject(AUTH_MODULE_OPTIONS) private moduleOptions: IAuthModuleOptions) {
    this.auth0Client = new ManagementClient({
      domain: this.moduleOptions.domain,
      clientId: this.moduleOptions.clientId,
      clientSecret: this.moduleOptions.secret,
    });
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    await this.auth0Client.users
      .update(
        { id: userId },
        {
          email: newEmail,
          email_verified: true,
        },
      )
      .catch(err => {
        new UserEmailUpdateException({ cause: err });
      });
  }
}
