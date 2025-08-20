import { RegularPaymentsService } from '@api/domain/regular-payments/services/regular-payments.service';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
import { RegularPaymentsAdminController } from './regular-payments.admin.controller';

describe('RegularPaymentsAdminController', () => {
  let controller: RegularPaymentsAdminController;

  beforeEach(async () => {
    const regulationsService = getMockedInstance(RegularPaymentsService);
    controller = new RegularPaymentsAdminController(regulationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
