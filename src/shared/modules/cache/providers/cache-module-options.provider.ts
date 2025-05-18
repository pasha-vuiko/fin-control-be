import { Provider } from '@nestjs/common';

import { ICacheModuleOptions } from '@shared/modules/cache/interfaces/cache-module-options.interface';

export const CACHE_MODULE_OPTIONS = Symbol('CACHE_MODULE_OPTIONS');

export function cacheModuleOptionsProvider(
  options: ICacheModuleOptions,
): Provider<ICacheModuleOptions> {
  return {
    provide: CACHE_MODULE_OPTIONS,
    useValue: options,
  };
}
