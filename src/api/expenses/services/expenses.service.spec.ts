import { vitest } from 'vitest';

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { Sex } from '@api/customers/enums/sex.enum';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { CustomersService } from '@api/customers/services/customers.service';
import { ExpenseCreateDto } from '@api/expenses/dto/expense-create.dto';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { mockModuleWithProviders } from '../../../../test/utils/mock-module-providers.util';
import { ExpensesService } from './expenses.service';

const mockCustomer: ICustomer = {
  id: '1',
  userId: '2',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@gmail.com',
  birthdate: new Date(),
  phone: '+380989898989',
  sex: Sex.MALE,
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
  let service: ExpensesService;
  let expensesRepository: ExpensesRepository;
  let customersService: CustomersService;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        mockModuleWithProviders(DrizzleModule, [
          { provide: DRIZZLE_CLIENT, useValue: {} },
        ]),
        CustomersModule,
      ],
      providers: [ExpensesService, ExpensesRepository],
    })
      .overrideProvider(ExpensesRepository)
      .useValue(getMockedInstance(ExpensesRepository))
      .overrideProvider(CustomersService)
      .useValue(getMockedInstance(CustomersService))
      .compile();

    service = module.get<ExpensesService>(ExpensesService);
    expensesRepository = module.get<ExpensesRepository>(ExpensesRepository);
    customersService = module.get<CustomersService>(CustomersService);
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

      const result = await service.findManyAsCustomer(userId, pagination);
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

      const result = await service.findManyAsAdmin({ ...mockPagination });
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

      const result = await service.findOneAsCustomer(expenseId, userId);
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

      await expect(service.findOneAsCustomer(expenseId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneAsAdmin()', () => {
    it('should return a single expense', async () => {
      const expenseId = 'expense-id';
      const expense = structuredClone(mockExpense); // Mock expense object

      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(expense);

      const result = await service.findOneAsAdmin(expenseId);
      const expectedResult = ExpenseEntity.fromExpenseObj(expense);

      expect(result).toStrictEqual(expectedResult);
      expect(expensesRepository.findOne).toHaveBeenCalledWith(expenseId);
    });

    it('should throw NotFoundException if expense is not found', async () => {
      const expenseId = 'expense-id';

      vitest.spyOn(expensesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOneAsAdmin(expenseId)).rejects.toThrow(NotFoundException);
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
        .mockResolvedValueOnce(createdExpenses.length);

      const result = await service.createMany(expensesToCreate, userId);

      expect(result).toEqual(createdExpenses.length);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(expensesRepository.createMany).toHaveBeenCalledWith(expect.anything());
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('update()', () => {
    it('should update and return an expense for a customer', async () => {
      const id = '1';
      const userId = '1';
      const customer = structuredClone(mockCustomer);
      const updateExpenseDto = structuredClone(mockExpenseToUpdate); // Mock update object

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(service, 'findOneAsCustomer')
        .mockResolvedValueOnce({ customerId: customer } as any);
      vitest.spyOn(expensesRepository, 'update').mockResolvedValueOnce(true);

      const result = await service.update(id, updateExpenseDto, userId);

      expect(result).toEqual(true);
      expect(expensesRepository.update).toHaveBeenCalledWith(id, expect.anything());
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = 'expense-id';
      const userId = 'user-id';
      const updateExpenseDto = structuredClone(mockExpenseToUpdate); // Mock update object

      vitest
        .spyOn(customersService, 'findOneByUserId')
        .mockRejectedValueOnce(new NotFoundException());

      await expect(service.update(id, updateExpenseDto, userId)).rejects.toThrow(
        NotFoundException,
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
        .spyOn(service, 'findOneAsCustomer')
        .mockRejectedValueOnce(new NotFoundException());

      await expect(service.update(id, updateExpenseDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(service.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      // Verify that update is not called since expense was not found for the customer
      expect(expensesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete an expense for a customer and return the deleted expense', async () => {
      const id = '1';
      const userId = '1';
      const customer = structuredClone(mockCustomer);
      const expense = structuredClone(mockExpense);

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest.spyOn(service, 'findOneAsCustomer').mockResolvedValueOnce(expense as any);
      vitest.spyOn(expensesRepository, 'delete').mockResolvedValueOnce(true);

      const result = await service.delete(id, userId);

      expect(result).toEqual(true);
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
      vitest.spyOn(service, 'findOneAsCustomer').mockResolvedValueOnce(expense);

      await expect(service.delete(id, userId)).rejects.toThrow(NotFoundException);
      expect(expensesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
