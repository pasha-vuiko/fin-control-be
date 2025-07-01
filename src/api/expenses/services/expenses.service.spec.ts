import { ExpenseCategory } from '@prisma-definitions/client/client';
import { vitest } from 'vitest';

import { NotFoundException } from '@nestjs/common';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { CustomersService } from '@api/customers/services/customers.service';
import { ExpenseCreateDto } from '@api/expenses/dto/expense-create.dto';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ExpenseIsNotFoundException } from '@api/expenses/exceptions/exception-classes';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { ExpensesService } from './expenses.service';

const mockCustomer: ICustomer = {
  id: '1',
  userId: '2',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@gmail.com',
  birthdate: new Date(),
  phone: '+380989898989',
  sex: 'MALE',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockExpense: IExpense = {
  id: '1',
  customerId: '1',
  date: new Date(),
  amount: 50,
  category: ExpenseCategory.FOOD,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockExpenseToCreate: ExpenseCreateDto = {
  amount: 50,
  category: ExpenseCategory.FOOD,
  date: new Date().toDateString(),
};
const mockExpenseToUpdate: ExpenseCreateDto = {
  amount: 100,
  category: ExpenseCategory.CLOTHES,
  date: new Date().toDateString(),
};
const mockPagination: PagePaginationDto = {
  page: 1,
  numOfItems: 1,
};

// eslint-disable-next-line max-lines-per-function
describe('ExpensesService', () => {
  let expensesService: ExpensesService;
  let expensesRepository: ExpensesRepository;
  let customersService: CustomersService;

  beforeEach(async () => {
    expensesRepository = getMockedInstance(ExpensesRepository);
    customersService = getMockedInstance(CustomersService);
    expensesService = new ExpensesService(expensesRepository, customersService);
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  describe('findManyAsCustomer()', () => {
    it('should return expenses for a given customer', async () => {
      const userId = '1';
      const customerId = '1';
      const customer = structuredClone(mockCustomer);
      const pagination = { ...mockPagination };
      const expenses = [structuredClone(mockExpense)];
      const paginatedExpenses: IPagePaginationOutput<IExpense> = {
        total: 1,
        items: expenses,
      };

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(expensesRepository, 'findManyByCustomer')
        .mockResolvedValueOnce(paginatedExpenses);

      const result = await expensesService.findManyAsCustomer(userId, pagination);
      const expectedResult = new PagePaginationOutputEntity<ExpenseEntity>({
        items: expenses.map(ExpenseEntity.fromExpenseObj),
        total: paginatedExpenses.total,
      });

      expect(result).toStrictEqual(expectedResult);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(expensesRepository.findManyByCustomer).toHaveBeenCalledWith(
        customerId,
        pagination,
      );
    });
  });

  describe('findManyAsAdmin()', () => {
    it('should return all expenses', async () => {
      const expenses = [structuredClone(mockExpense)]; // Mock expenses array
      const paginatedExpenses: IPagePaginationOutput<IExpense> = {
        total: 1,
        items: expenses,
      };

      vitest
        .spyOn(expensesRepository, 'findMany')
        .mockResolvedValueOnce(paginatedExpenses);

      const result = await expensesService.findManyAsAdmin({ ...mockPagination });
      const expectedResult = new PagePaginationOutputEntity<ExpenseEntity>({
        items: expenses.map(ExpenseEntity.fromExpenseObj),
        total: paginatedExpenses.total,
      });

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.findMany).toHaveBeenCalledWith(mockPagination);
    });
  });

  describe('findOneAsCustomer()', () => {
    it('should return a single expense for a customer', async () => {
      const expenseId = '1';
      const userId = '1';
      const expense = structuredClone(mockExpense);
      const customer = structuredClone(mockCustomer);

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(expense);

      const result = await expensesService.findOneAsCustomer(expenseId, userId);
      const expectedResult = ExpenseEntity.fromExpenseObj(expense);

      expect(result).toStrictEqual(expectedResult);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(expensesRepository.findOne).toHaveBeenCalledWith(expenseId);
    });

    it('should throw NotFoundException if expense does not belong to the customer', async () => {
      const expenseId = '1';
      const userId = '2';
      const customer: CustomerEntity = {
        ...structuredClone(mockCustomer),
        id: '2',
      };
      const expense = structuredClone(mockExpense);

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(expense);

      await expect(expensesService.findOneAsCustomer(expenseId, userId)).rejects.toThrow(
        ExpenseIsNotFoundException,
      );
    });
  });

  describe('findOneAsAdmin()', () => {
    it('should return a single expense', async () => {
      const expenseId = 'expense-id';
      const expense = structuredClone(mockExpense); // Mock expense object

      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(expense);

      const result = await expensesService.findOneAsAdmin(expenseId);
      const expectedResult = ExpenseEntity.fromExpenseObj(expense);

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.findOne).toHaveBeenCalledWith(expenseId);
    });

    it('should throw NotFoundException if expense is not found', async () => {
      const expenseId = 'expense-id';

      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(expensesService.findOneAsAdmin(expenseId)).rejects.toThrow(
        ExpenseIsNotFoundException,
      );
    });
  });

  describe('createMany()', () => {
    it('should create and return multiple expenses for a customer', async () => {
      const userId = '1';
      const customer = structuredClone(mockCustomer);
      const expensesToCreate = [structuredClone(mockExpenseToCreate)]; // Mock array of expenses to create
      const createdExpenses = [structuredClone(mockExpense)]; // Mock array of created expenses

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(expensesRepository, 'createMany')
        .mockResolvedValueOnce(createdExpenses);

      const result = await expensesService.createMany(expensesToCreate, userId);
      const expectedResult = createdExpenses.map(ExpenseEntity.fromExpenseObj);

      expect(result).toStrictEqual(expectedResult);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(expensesRepository.createMany).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('createManyViaTransaction()', () => {
    it('should create and return multiple expenses via transaction', async () => {
      const expensesToCreate: IExpenseCreateInput[] = [
        {
          ...structuredClone(mockExpenseToCreate),
          customerId: '1',
        },
      ]; // Mock array of expenses to create
      const createdExpenses = [structuredClone(mockExpense)]; // Mock array of created expenses

      vitest
        .spyOn(expensesRepository, 'createManyViaTransaction')
        .mockResolvedValueOnce(createdExpenses);

      const result = await expensesService.createManyViaTransaction(expensesToCreate);
      const expectedResult = createdExpenses.map(ExpenseEntity.fromExpenseObj);

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.createManyViaTransaction).toHaveBeenCalledWith(
        expensesToCreate,
      );
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('update()', () => {
    it('should update and return an expense for a customer', async () => {
      const id = '1';
      const userId = '1';
      const customer = structuredClone(mockCustomer);
      const updateExpenseDto = structuredClone(mockExpenseToUpdate); // Mock update object
      const updatedExpense: ExpenseEntity = {
        ...structuredClone(mockExpense),
        ...updateExpenseDto,
        date: new Date(updateExpenseDto.date),
      }; // Mock updated expense

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(expensesService, 'findOneAsCustomer')
        .mockResolvedValueOnce({ customerId: customer } as any);
      vitest.spyOn(expensesRepository, 'update').mockResolvedValueOnce(updatedExpense);

      const result = await expensesService.update(id, updateExpenseDto, userId);
      const expectedResult = ExpenseEntity.fromExpenseObj(updatedExpense);

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.update).toHaveBeenCalledWith(id, expect.anything());
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = 'expense-id';
      const userId = 'user-id';
      const updateExpenseDto = structuredClone(mockExpenseToUpdate); // Mock update object

      vitest
        .spyOn(customersService, 'findOneByUserId')
        .mockRejectedValueOnce(new ExpenseIsNotFoundException());
      vitest
        .spyOn(expensesRepository, 'update')
        .mockResolvedValueOnce(structuredClone(mockExpense));

      await expect(expensesService.update(id, updateExpenseDto, userId)).rejects.toThrow(
        ExpenseIsNotFoundException,
      );
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      // Verify that update is not called since customer was not found
      expect(expensesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if expense is not found for the customer', async () => {
      const id = 'expense-id';
      const userId = 'user-id';
      const customer = structuredClone(mockCustomer);
      const updateExpenseDto = {}; // Mock update object

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(expensesService, 'findOneAsCustomer')
        .mockRejectedValueOnce(new NotFoundException());
      vitest
        .spyOn(expensesRepository, 'update')
        .mockResolvedValueOnce(structuredClone(mockExpense));

      await expect(expensesService.update(id, updateExpenseDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(expensesService.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      // Verify that update is not called since expense was not found for the customer
      expect(expensesRepository.update).not.toHaveBeenCalled();
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('delete()', () => {
    it('should delete an expense for a customer and return the deleted expense', async () => {
      const id = '1';
      const userId = '1';
      const customer = structuredClone(mockCustomer);
      const expense = structuredClone(mockExpense);

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(expensesService, 'findOneAsCustomer')
        .mockResolvedValueOnce(expense as any);
      vitest.spyOn(expensesRepository, 'delete').mockResolvedValueOnce(expense);

      const result = await expensesService.delete(id, userId);
      const expectedResult = ExpenseEntity.fromExpenseObj(expense);

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the expense does not belong to the customer', async () => {
      const id = '1';
      const userId = '1';
      const customer = {
        ...structuredClone(mockCustomer),
        id: '2',
      };
      const expense = structuredClone(mockExpense);

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest.spyOn(expensesService, 'findOneAsCustomer').mockResolvedValueOnce(expense);
      vitest
        .spyOn(expensesRepository, 'delete')
        .mockResolvedValueOnce(structuredClone(mockExpense));

      await expect(expensesService.delete(id, userId)).rejects.toThrow(
        ExpenseIsNotFoundException,
      );
      expect(expensesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
