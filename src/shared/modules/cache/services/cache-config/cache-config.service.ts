import KeyvValkey from '@keyv/valkey';
import Valkey from 'iovalkey';
import Keyv from 'keyv';

import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';

import { ICacheModuleOptions } from '@shared/modules/cache/interfaces/cache-module-options.interface';
import { CACHE_MODULE_OPTIONS } from '@shared/modules/cache/providers/cache-module-options.provider';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { omitObjKeys } from '@shared/utils/omit-obj-keys.util';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static moduleOptions: ICacheModuleOptions;
  private static ioValkeyInstance: Valkey;
  private static logger = new Logger(CacheConfigService.name);

  constructor(@Inject(CACHE_MODULE_OPTIONS) private moduleOptions: ICacheModuleOptions) {
    CacheConfigService.moduleOptions = moduleOptions;
  }

  onApplicationShutdown(): void {
    CacheConfigService.getIoValkeyInstance().disconnect();
    CacheConfigService.logger.log('Successfully disconnected from the Valkey');
  }

  public createCacheOptions(): CacheModuleOptions {
    const valKey = new KeyvValkey(CacheConfigService.getIoValkeyInstance());
    const keyv = new Keyv({
      store: valKey,
      ttl: this.moduleOptions.ttl,
    });

    return {
      stores: [keyv],
    };
  }

  public static getIoValkeyInstance(): Valkey {
    if (this.ioValkeyInstance) {
      return this.ioValkeyInstance;
    }

    if (this.moduleOptions.valkeyUrl) {
      this.ioValkeyInstance = new Valkey(
        this.moduleOptions.valkeyUrl,
        omitObjKeys(this.moduleOptions, 'valkeyUrl'),
      );
    } else {
      this.ioValkeyInstance = new Valkey(this.moduleOptions);
    }

    this.listenToValkeyConnection(this.ioValkeyInstance);
    this.listenToValkeyError(this.ioValkeyInstance);

    return this.ioValkeyInstance;
  }

  private static listenToValkeyError(valkeyClient: Valkey): void {
    valkeyClient.on('error', err => {
      this.logger.error(`Valkey error: ${err.message}`);
    });
  }

  private static listenToValkeyConnection(valkeyClient: Valkey): void {
    valkeyClient.on('connect', () => {
      this.logger.log(`Successfully connected to the Valkey`);
    });
  }
}
