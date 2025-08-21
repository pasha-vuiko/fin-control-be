import { vitest } from 'vitest';

import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
import { RegularPaymentsController } from './regular-payments.controller';

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  beforeEach(async () => {
    const regulationsService = getMockedInstance(RegularPaymentsService);
    controller = new RegularPaymentsController(regulationsService);
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
