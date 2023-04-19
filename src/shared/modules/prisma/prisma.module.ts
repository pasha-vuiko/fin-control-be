import { DynamicModule, Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TPrismaOptions } from '@shared/modules/prisma/types/prisma-options.type';
import { PRISMA_MODULE_OPTIONS } from '@shared/modules/prisma/constants/prisma-module-options-injection-token';

@Global()
@Module({})
export class PrismaModule {
  public static forRoot(options?: TPrismaOptions): DynamicModule {
    return {
      module: PrismaModule,
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
