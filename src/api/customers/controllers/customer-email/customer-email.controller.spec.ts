import { CustomerEmailController } from './customer-email.controller';

describe('CustomerEmailController', () => {
  let controller: CustomerEmailController;

  beforeEach(async () => {
    controller = new CustomerEmailController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
