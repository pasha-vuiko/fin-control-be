import { Provider } from '@nestjs/common/interfaces';

import { DKronModuleOptions } from '@shared/modules/d-kron/interfaces/job-scheduler-module-options.interface';

export const JOB_SCHEDULED_MODULE_OPTIONS = Symbol('JOB_SCHEDULED_MODULE_OPTIONS');

export function getJobSchedulerModuleProvider(
  options: DKronModuleOptions,
): Provider<DKronModuleOptions> {
  return {
    provide: JOB_SCHEDULED_MODULE_OPTIONS,
    useValue: options,
  };
}
