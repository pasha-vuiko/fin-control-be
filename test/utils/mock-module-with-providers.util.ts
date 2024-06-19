import { DynamicModule, Provider, Type } from '@nestjs/common';

export function mockModuleWithProviders(
  module: Type<any>,
  providers: Provider[],
  global = true,
): DynamicModule {
  return {
    global,
    module,
    providers,
    exports: providers,
  };
}
