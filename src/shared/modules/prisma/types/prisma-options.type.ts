import { Prisma } from '@prisma-definitions/client';

export type TPrismaOptions<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
> = Prisma.Subset<T, Prisma.PrismaClientOptions> & {
  applicationName?: string;
};
