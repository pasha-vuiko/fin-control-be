import { Provider } from '@nestjs/common/interfaces';

import { IEmailModuleOptions } from '@shared/modules/email/interfaces/email-module-options.interface';

export const EMAIL_MODULE_OPTIONS = Symbol('EMAIL_MODULE_OPTIONS');

export function getEmailModuleOptionsProvider(
  options: IEmailModuleOptions,
): Provider<IEmailModuleOptions> {
  return {
    provide: EMAIL_MODULE_OPTIONS,
    useValue: options,
  };
}
