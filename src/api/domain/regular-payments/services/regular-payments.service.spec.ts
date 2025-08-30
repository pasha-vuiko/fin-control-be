import { ExpenseCategory } from '@prisma/client';
import { vitest } from 'vitest';

import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DKronService } from '@shared/modules/d-kron/services/d-kron/d-kron.service';

import { CustomerEntity } from '@api/domain/customers/entities/customer.entity';
import { CustomersService } from '@api/domain/customers/services/customers.service';
import { RegularPaymentCreateDto } from '@api/domain/regular-payments/dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from '@api/domain/regular-payments/dto/regular-payment-update.dto';
import { RegularPaymentEntity } from '@api/domain/regular-payments/entities/regular-payment.entity';
import { RegularPaymentFromDb } from '@api/domain/regular-payments/interfaces/regular-payment-from-db.interface';
import { RegularPaymentsRepository } from '@api/domain/regular-payments/repositories/regular-payments.repository';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
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
const mockRegularPayment: RegularPaymentFromDb = {
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
  let dKronService: DKronService;

  beforeEach(async () => {
    regularPaymentsRepository = getMockedInstance(RegularPaymentsRepository);
    customersService = getMockedInstance(CustomersService);
    dKronService = getMockedInstance(DKronService);

    regularPaymentsService = new RegularPaymentsService(
      regularPaymentsRepository,
      customersService,
      dKronService,
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
      const dbResponse: IPagePaginationOutput<RegularPaymentFromDb> = {
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
      const dbResponse: IPagePaginationOutput<RegularPaymentFromDb> = {
        total: 1,
        items: [regularPayment],
      };

      vi.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
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

  describe('findOneAsAdmin()', () => {
    it('returns a regular payment by id', async () => {
      const id = 'rp-1';
      const regularPaymentsRepositoryFindOneSpy = vitest
        .spyOn(regularPaymentsRepository, 'findOne')
        .mockResolvedValueOnce(structuredClone(mockRegularPayment));

      const result = await regularPaymentsService.findOneAsAdmin(id);

      expect(result).toStrictEqual(
        RegularPaymentEntity.fromPlainObj(structuredClone(mockRegularPayment)),
      );
      expect(regularPaymentsRepositoryFindOneSpy).toHaveBeenCalledWith(id);
    });

    it('throws when regular payment not found', async () => {
      const id = 'rp-missing';
      vitest.spyOn(regularPaymentsRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(regularPaymentsService.findOneAsAdmin(id)).rejects.toBeDefined();
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('findOneAsCustomer()', () => {
    it('returns entity for matching customer', async () => {
      const id = 'rp-1';
      const userId = 'user-1';
      const regularPayment = {
        ...structuredClone(mockRegularPayment),
        customerId: 'cust-1',
      };
      const customer = CustomerEntity.fromCustomerObj({
        ...mockCustomer,
        id: 'cust-1',
      } as any);

      const regularPaymentsRepositoryFindOneSpy = vitest
        .spyOn(regularPaymentsRepository, 'findOne')
        .mockResolvedValueOnce(regularPayment);
      const customersServiceFindOneByUserIdSpy = vitest
        .spyOn(customersService, 'findOneByUserId')
        .mockResolvedValueOnce(customer);

      const result = await regularPaymentsService.findOneAsCustomer(id, userId);

      expect(result).toStrictEqual(RegularPaymentEntity.fromPlainObj(regularPayment));
      expect(regularPaymentsRepositoryFindOneSpy).toHaveBeenCalledWith(id);
      expect(customersServiceFindOneByUserIdSpy).toHaveBeenCalledWith(userId);
    });

    it('throws when not found or mismatch customer', async () => {
      const id = 'rp-1';
      const userId = 'user-1';
      const regularPayment = {
        ...structuredClone(mockRegularPayment),
        customerId: 'cust-2',
      };
      const customer = CustomerEntity.fromCustomerObj({
        ...mockCustomer,
        id: 'cust-1',
      } as any);

      vitest
        .spyOn(regularPaymentsRepository, 'findOne')
        .mockResolvedValueOnce(regularPayment);
      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);

      await expect(
        regularPaymentsService.findOneAsCustomer(id, userId),
      ).rejects.toBeDefined();
    });
  });

  // eslint-disable-next-line max-lines-per-function
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

      vi.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
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
      // Validate scheduler job creation args
      const createdDate = new Date(createDto.dateOfCharge);
      const expectedJobName = `regular-payment-apply-${createdRegularPayment.id}`;
      expect(dKronService.createHttpCronJob).toHaveBeenCalledWith(
        expectedJobName,
        [{ dayOfMonth: createdDate.getMonth() + 1 }],
        {
          jobType: 'regular-payment-apply',
          payload: { regularPaymentId: createdRegularPayment.id },
        },
      );
    });
  });

  // eslint-disable-next-line max-lines-per-function
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
      expect(dKronService.createHttpCronJob).toHaveBeenCalled();
    });

    // eslint-disable-next-line max-lines-per-function
    it('maps dateOfCharge and upserts scheduler with correct args', async () => {
      const id = 'payment-id';
      const userId = '1';
      const dateStr = '2024-03-28T00:00:00.000Z';
      const updateDto: RegularPaymentUpdateDto = {
        amount: 200,
        dateOfCharge: dateStr,
      };
      const updatedRegularPayment = {
        ...structuredClone(mockRegularPayment),
        id,
        amount: updateDto.amount as number,
        dateOfCharge: new Date(dateStr),
      };

      vitest
        .spyOn(regularPaymentsService, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest
        .spyOn(regularPaymentsRepository, 'update')
        .mockResolvedValueOnce(updatedRegularPayment);

      await regularPaymentsService.update(id, updateDto, userId);

      // update called with mapped fields
      expect(regularPaymentsRepository.update).toHaveBeenCalledWith(id, {
        amount: updateDto.amount?.toString(),
        dateOfCharge: new Date(updateDto.dateOfCharge as string),
      });

      // upsertSchedulerJob called via DKronService with correct args
      const expectedJobName = `regular-payment-apply-${id}`;
      expect(dKronService.createHttpCronJob).toHaveBeenCalledWith(
        expectedJobName,
        [{ dayOfMonth: new Date(dateStr).getMonth() + 1 }],
        {
          jobType: 'regular-payment-apply',
          payload: { regularPaymentId: id },
        },
      );
    });

    it('throws when repository.update returns null', async () => {
      const id = 'payment-id';
      const userId = '1';
      const updateDto: RegularPaymentUpdateDto = { amount: 100 };

      vitest
        .spyOn(regularPaymentsService, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest.spyOn(regularPaymentsRepository, 'update').mockResolvedValueOnce(null);

      await expect(
        regularPaymentsService.update(id, updateDto, userId),
      ).rejects.toBeDefined();
      expect(dKronService.createHttpCronJob).not.toHaveBeenCalled();
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

  describe('delete() when not found', () => {
    it('throws when repository.delete returns null', async () => {
      const id = 'payment-id';
      const userId = '1';

      vitest
        .spyOn(regularPaymentsService, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest.spyOn(regularPaymentsRepository, 'delete').mockResolvedValueOnce(null);

      await expect(regularPaymentsService.delete(id, userId)).rejects.toBeDefined();
    });
  });
});
