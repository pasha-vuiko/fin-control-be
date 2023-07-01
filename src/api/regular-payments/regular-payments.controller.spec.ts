import { Test, TestingModule } from '@nestjs/testing';

import { RegularPaymentsController } from './regular-payments.controller';
import { RegularPaymentsService } from './regular-payments.service';

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegularPaymentsController],
      providers: [RegularPaymentsService],
    }).compile();

    controller = module.get<RegularPaymentsController>(RegularPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
