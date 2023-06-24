import { Test, TestingModule } from '@nestjs/testing';

import { PRISMA_MODULE_OPTIONS } from '@shared/modules/prisma/constants/prisma-module-options-injection-token';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: PRISMA_MODULE_OPTIONS,
          useValue: undefined,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
