import { vitest } from 'vitest';

import { ExpensesService } from '@api/domain/expenses/services/expenses.service';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
import { ExpensesController } from './expenses.controller';

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    const expensesService = getMockedInstance(ExpensesService);
    controller = new ExpensesController(expensesService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
