import { DynamicModule, Module } from '@nestjs/common';

import { PRISMA_MODULE_OPTIONS } from '@shared/modules/prisma/constants/prisma-module-options-injection-token';
import { TPrismaOptions } from '@shared/modules/prisma/types/prisma-options.type';

import { PrismaService } from './prisma.service';

@Module({})
export class PrismaModule {
  public static forRoot(options?: TPrismaOptions): DynamicModule {
    return {
      module: PrismaModule,
      global: true,
      providers: [
        {
          provide: PRISMA_MODULE_OPTIONS,
          useValue: options,
        },
        PrismaService,
      ],
      exports: [PrismaService],
    };
  }
}
