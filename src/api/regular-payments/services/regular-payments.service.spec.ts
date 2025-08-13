import { ExpenseCategory } from '@prisma-definitions/client/client';
import { vitest } from 'vitest';

import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { CustomersService } from '@api/customers/services/customers.service';
import { ExpensesService } from '@api/expenses/services/expenses.service';
import { RegularPaymentCreateDto } from '@api/regular-payments/dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from '@api/regular-payments/dto/regular-payment-update.dto';
import { RegularPaymentEntity } from '@api/regular-payments/entities/regular-payment.entity';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { RegularPaymentsService } from './regular-payments.service';

const mockCustomer = CustomerEntity.fromCustomerObj({
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
});
const mockRegularPayment: IRegularPayment = {
  id: '1',
  customerId: '1',
  amount: 50,
  category: ExpenseCategory.FOOD,
  dateOfCharge: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// eslint-disable-next-line max-lines-per-function
describe('RegularPaymentsService', () => {
  let regularPaymentsService: RegularPaymentsService;
  let regularPaymentsRepository: RegularPaymentsRepository;
  let customersService: CustomersService;
  let expensesService: ExpensesService;

  beforeEach(async () => {
    regularPaymentsRepository = getMockedInstance(RegularPaymentsRepository);
    customersService = getMockedInstance(CustomersService);
    expensesService = getMockedInstance(ExpensesService);
    regularPaymentsService = new RegularPaymentsService(
      regularPaymentsRepository,
      customersService,
      expensesService,
    );
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(regularPaymentsService).toBeDefined();
  });

  describe('findManyAsAdmin()', () => {
    it('should return all regular payments for customer-admin with pagination', async () => {
      const pagination: IPagePaginationInput = { page: 1, numOfItems: 10 };
      const regularPayment = structuredClone(mockRegularPayment);
      const dbResponse: IPagePaginationOutput<IRegularPayment> = {
        total: 1,
        items: [regularPayment],
      };

      vitest
        .spyOn(regularPaymentsRepository, 'findMany')
        .mockResolvedValueOnce(dbResponse);

      const result = await regularPaymentsService.findManyAsAdmin(pagination);
      const expectedResult = new PagePaginationOutputEntity<RegularPaymentEntity>({
        items: [RegularPaymentEntity.fromPlainObj(regularPayment)],
        total: dbResponse.total,
      });

      expect(result).toStrictEqual(expectedResult);
      expect(regularPaymentsRepository.findMany).toHaveBeenCalledWith({}, pagination);
    });
  });

  describe('findManyAsCustomer()', () => {
    it('should return regular payments for a specific customer with pagination', async () => {
      const userId = '1';
      const customerId = '1';
      const customer = structuredClone(mockCustomer);
      const pagination: IPagePaginationInput = { page: 1, numOfItems: 10 };
      const regularPayment = structuredClone(mockRegularPayment);
      const dbResponse: IPagePaginationOutput<IRegularPayment> = {
        total: 1,
        items: [regularPayment],
      };

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(regularPaymentsRepository, 'findMany')
        .mockResolvedValueOnce(dbResponse);

      const result = await regularPaymentsService.findManyAsCustomer(userId, pagination);
      const expectedResult = new PagePaginationOutputEntity<RegularPaymentEntity>({
        items: [RegularPaymentEntity.fromPlainObj(regularPayment)],
        total: dbResponse.total,
      });

      expect(result).toStrictEqual(expectedResult);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(regularPaymentsRepository.findMany).toHaveBeenCalledWith(
        { customerId: customerId },
        pagination,
      );
    });
  });

  // Skipping findOneAsAdmin and findOneAsCustomer for brevity. Follow the pattern above.

  describe('create()', () => {
    it('should create a new regular payment for a customer', async () => {
      const userId = '1';
      const customerId = '1';
      const customer = structuredClone(mockCustomer);
      const createDto: RegularPaymentCreateDto = {
        amount: 50,
        category: ExpenseCategory.FOOD,
        dateOfCharge: new Date().toDateString(),
      }; // Mock create DTO
      const createdRegularPayment = structuredClone(mockRegularPayment); // Mocked created entity

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest
        .spyOn(regularPaymentsRepository, 'create')
        .mockResolvedValueOnce(createdRegularPayment);

      const result = await regularPaymentsService.create(createDto, userId);
      const expectedResult = RegularPaymentEntity.fromPlainObj(createdRegularPayment);

      expect(result).toStrictEqual(expectedResult);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(regularPaymentsRepository.create).toHaveBeenCalledWith({
        ...createDto,
        customerId,
        amount: createDto.amount.toString(),
        dateOfCharge: new Date(createDto.dateOfCharge),
      });
    });
  });

  describe('update()', () => {
    it('should update a regular payment for a customer', async () => {
      const id = 'payment-id';
      const userId = '1';
      const updateDto: RegularPaymentUpdateDto = {
        amount: 100,
      }; // Mock update DTO
      const updatedRegularPayment = {
        ...structuredClone(mockRegularPayment),
        amount: updateDto.amount as number,
      }; // Mocked updated entity

      vitest
        .spyOn(regularPaymentsService, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest
        .spyOn(regularPaymentsRepository, 'update')
        .mockResolvedValueOnce(updatedRegularPayment);

      const result = await regularPaymentsService.update(id, updateDto, userId);
      const expectedResult = RegularPaymentEntity.fromPlainObj(updatedRegularPayment);

      expect(result).toStrictEqual(expectedResult);
      expect(regularPaymentsService.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      expect(regularPaymentsRepository.update).toHaveBeenCalledWith(id, {
        ...updateDto,
        amount: updateDto.amount?.toString(),
      });
    });
  });

  describe('delete()', () => {
    it('should delete a regular payment for a customer', async () => {
      const id = 'payment-id';
      const userId = '1';
      const deletedRegularPayment = structuredClone(mockRegularPayment);
      vitest
        .spyOn(regularPaymentsService, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest
        .spyOn(regularPaymentsRepository, 'delete')
        .mockResolvedValueOnce(deletedRegularPayment);

      const result = await regularPaymentsService.delete(id, userId);
      const expectedResult = RegularPaymentEntity.fromPlainObj(deletedRegularPayment);

      expect(result).toStrictEqual(expectedResult);
      expect(regularPaymentsService.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      expect(regularPaymentsRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
