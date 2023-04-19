import { Prisma } from '../../../../../prisma/client';

export type TPrismaOptions<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
> = Prisma.Subset<T, Prisma.PrismaClientOptions>;
