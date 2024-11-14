import { CustomersService } from '@api/customers/services/customers.service';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { CustomersAdminController } from './customers.admin.controller';

describe('CustomersAdminController', () => {
  let controller: CustomersAdminController;

  beforeEach(async () => {
    const customersService = getMockedInstance(CustomersService);
    controller = new CustomersAdminController(customersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
