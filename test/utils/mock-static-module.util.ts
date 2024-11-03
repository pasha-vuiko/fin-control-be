import { DynamicModule, Provider, Type } from '@nestjs/common';

import { TConstructor } from '@shared/types/constructor.type';

import { getMockedInstance } from './get-mocked-instance.util';

// eslint-disable-next-line max-lines-per-function
export function mockStaticModule(module: Type<any>): DynamicModule {
  const originalProvidersToMockProviders = new Map<Provider, Provider>();

  const dynamicModule: DynamicModule = {
    module,
    controllers: [],
  };
  const metadata = Reflect.getMetadataKeys(module) as string[];

  for (const key of metadata) {
    const value = Reflect.getMetadata(key, module);

    if (key === 'providers') {
      const providers = value as Provider[];

      for (const provider of providers) {
        const mockProvider = getMockProvider(provider);

        originalProvidersToMockProviders.set(provider, mockProvider);
      }
    }

    if (key === 'imports') {
      const imports = value as Type<any>[];

      for (const importedModule of imports) {
        const mockImportedModule = mockStaticModule(importedModule);

        dynamicModule.imports?.push(mockImportedModule);
      }
    }

    if (key === 'controllers') {
      const controllers = value as Type<any>[];

      for (const controller of controllers) {
        const mockController = getMockedInstance(controller as TConstructor<any>);

        dynamicModule.controllers?.push(mockController);
      }
    }

    if (key === 'exports') {
      const exports = value as Provider[];

      for (const exportProvider of exports) {
        const exportProviderMetadata = Reflect.getMetadataKeys(
          exportProvider,
        ) as string[];

        if (!exportProviderMetadata.includes('__injectable__')) {
          const mockImportedModule = mockStaticModule(exportProvider as Type<any>);

          dynamicModule.imports?.push(mockImportedModule);
        }

        const cachedMockExportProvider =
          originalProvidersToMockProviders.get(exportProvider);

        if (cachedMockExportProvider) {
          dynamicModule.exports?.push(cachedMockExportProvider);
          continue;
        }

        const newMockExportProvider = getMockProvider(exportProvider);
        dynamicModule.exports?.push(newMockExportProvider);
      }
    }
  }

  return {
    ...dynamicModule,
    providers: originalProvidersToMockProviders.values().toArray(),
  };
}

function getMockProvider(provider: Provider): Provider {
  if (typeof provider === 'function') {
    return getMockedInstance(provider as TConstructor<Provider>);
  }

  return {
    provide: provider.provide,
    useValue: {},
  };
}
