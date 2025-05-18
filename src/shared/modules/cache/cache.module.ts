import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';

import { JsonCacheInterceptor } from '@shared/modules/cache/interceptors/json-cache/json-cache.interceptor';
import { ICacheModuleOptions } from '@shared/modules/cache/interfaces/cache-module-options.interface';
import { cacheModuleOptionsProvider } from '@shared/modules/cache/providers/cache-module-options.provider';
import { CacheConfigService } from '@shared/modules/cache/services/cache-config/cache-config.service';
import { ValkeyService } from '@shared/modules/cache/services/valkey/valkey.service';

@Module({
  exports: [CacheModule, ValkeyService, CacheConfigService],
})
export class CacheModule {
  static forRoot(opts: ICacheModuleOptions = {}): DynamicModule {
    const filteredOptions = filterModuleOptions(opts);
    const moduleOptionsProvider = cacheModuleOptionsProvider(filteredOptions);

    return {
      global: true,
      module: CacheModule,
      imports: [
        NestCacheModule.registerAsync({
          useClass: CacheConfigService,
          extraProviders: [moduleOptionsProvider],
        }),
      ],
      providers: [
        moduleOptionsProvider,
        ValkeyService,
        CacheConfigService,
        JsonCacheInterceptor,
      ],
      exports: [moduleOptionsProvider],
    };
  }
}

function filterModuleOptions(options: ICacheModuleOptions): ICacheModuleOptions {
  const resultConfig = {};

  for (const key of Object.getOwnPropertyNames(options)) {
    // @ts-expect-error - we are sure that key exists in options
    // eslint-disable-next-line security/detect-object-injection
    if (options[key] !== undefined) {
      // @ts-expect-error - we are sure that key exists in options
      // eslint-disable-next-line security/detect-object-injection
      resultConfig[key] = options[key];
    }
  }

  return resultConfig;
}
