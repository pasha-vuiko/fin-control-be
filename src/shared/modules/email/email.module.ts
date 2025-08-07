import { DynamicModule, Module } from '@nestjs/common';

import { IEmailModuleOptions } from '@shared/modules/email/interfaces/email-module-options.interface';
import { getEmailModuleOptionsProvider } from '@shared/modules/email/providers/email-module-options.provider';
import { SesEmailService } from '@shared/modules/email/services/ses-email/ses-email.service';

@Module({})
export class EmailModule {
  static forRoot(options: IEmailModuleOptions): DynamicModule {
    const optionsProvider = getEmailModuleOptionsProvider(options);

    return {
      global: true,
      module: EmailModule,
      providers: [SesEmailService, optionsProvider],
      exports: [SesEmailService, optionsProvider],
    };
  }
}
