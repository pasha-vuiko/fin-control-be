import { ExpensesService } from '@api/domain/expenses/services/expenses.service';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
import { ExpensesAdminController } from './expenses.admin.controller';

describe('ExpensesAdminController', () => {
  let controller: ExpensesAdminController;

  beforeEach(async () => {
    const expensesService = getMockedInstance(ExpensesService);
    controller = new ExpensesAdminController(expensesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
