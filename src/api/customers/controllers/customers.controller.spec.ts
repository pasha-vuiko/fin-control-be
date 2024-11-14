import { vitest } from 'vitest';

import { CustomersService } from '@api/customers/services/customers.service';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { CustomersController } from './customers.controller';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const customerService = getMockedInstance(CustomersService);
    controller = new CustomersController(customerService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
