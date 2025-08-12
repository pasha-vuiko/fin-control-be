import { DynamicModule, Module } from '@nestjs/common';

import { IDKronModuleOptions } from '@shared/modules/d-kron/interfaces/job-scheduler-module-options.interface';
import { getJobSchedulerModuleProvider } from '@shared/modules/d-kron/providers/job-scheduler-module-options.provider';
import { DKronService } from '@shared/modules/d-kron/services/d-kron/d-kron.service';
import { HttpModule } from '@shared/modules/http/http.module';

@Module({})
export class DKronModule {
  static forRoot(options: IDKronModuleOptions): DynamicModule {
    const optionsProvider = getJobSchedulerModuleProvider(options);

    return {
      global: true,
      module: DKronModule,
      imports: [HttpModule],
      providers: [optionsProvider, DKronService],
      exports: [optionsProvider, DKronService],
    };
  }
}
