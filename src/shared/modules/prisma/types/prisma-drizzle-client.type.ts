import { Prisma } from '@prisma/client';
import { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/binary';
import { PrismaPgDatabase } from 'drizzle-orm/prisma/pg';

import { PrismaService } from '@shared/modules/prisma/prisma.service';

// Type which describes Prisma Client with Drizzle extension included
export type TPrismaDrizzleClient = DynamicClientExtensionThis<
  Prisma.TypeMap<
    InternalArgs & {
      result: NonNullable<unknown>;
      model: NonNullable<unknown>;
      query: NonNullable<unknown>;
      client: { $drizzle: () => PrismaPgDatabase };
    },
    Prisma.PrismaClientOptions
  >,
  Prisma.TypeMapCb,
  {
    result: NonNullable<unknown>;
    model: NonNullable<unknown>;
    query: NonNullable<unknown>;
    client: { $drizzle: () => PrismaPgDatabase };
  }
> &
  PrismaService;
