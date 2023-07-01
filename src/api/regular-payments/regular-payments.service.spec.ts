import { Test, TestingModule } from '@nestjs/testing';

import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsService', () => {
  let service: RegularPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegularPaymentsService],
    }).compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
