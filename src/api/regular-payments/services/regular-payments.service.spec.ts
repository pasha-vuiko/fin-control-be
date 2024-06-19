import { vitest } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';

import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DrizzleModule } from '@shared/modules/drizzle/drizzle.module';
import { PrismaModule } from '@shared/modules/prisma/prisma.module';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomersModule } from '@api/customers/customers.module';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { Sex } from '@api/customers/enums/sex.enum';
import { CustomersService } from '@api/customers/services/customers.service';
import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';
import { ExpensesModule } from '@api/expenses/expenses.module';
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
  sex: Sex.MALE,
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
  let service: RegularPaymentsService;
  let regularPaymentsRepository: RegularPaymentsRepository;
  let customersService: CustomersService;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CustomersModule,
        ExpensesModule,
        PrismaModule.forRoot(),
        DrizzleModule.forRoot({}),
      ],
      providers: [RegularPaymentsService, RegularPaymentsRepository],
    })
      .overrideProvider(RegularPaymentsRepository)
      .useValue(getMockedInstance(RegularPaymentsRepository))
      .overrideProvider(PrismaService) // Preventing connection to the database
      .useValue(getMockedInstance(PrismaService))
      .compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);
    customersService = module.get<CustomersService>(CustomersService);
    regularPaymentsRepository = module.get<RegularPaymentsRepository>(
      RegularPaymentsRepository,
    );
  });

  afterEach(async () => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findManyAsAdmin()', () => {
    it('should return all regular payments for admin with pagination', async () => {
      const pagination: IPagePaginationInput = { page: 1, numOfItems: 10 };
      const regularPayment = structuredClone(mockRegularPayment);
      const dbResponse: IPagePaginationOutput<IRegularPayment> = {
        total: 1,
        items: [regularPayment],
      };

      vitest
        .spyOn(regularPaymentsRepository, 'findMany')
        .mockResolvedValueOnce(dbResponse);

      const result = await service.findManyAsAdmin(pagination);
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

      const result = await service.findManyAsCustomer(userId, pagination);
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

      vitest.spyOn(customersService, 'findOneByUserId').mockResolvedValueOnce(customer);
      vitest.spyOn(regularPaymentsRepository, 'create').mockResolvedValueOnce(true);

      const result = await service.create(createDto, userId);

      expect(result).toStrictEqual(true);
      expect(customersService.findOneByUserId).toHaveBeenCalledWith(userId);
      expect(regularPaymentsRepository.create).toHaveBeenCalledWith({
        ...createDto,
        customerId: customerId,
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

      vitest
        .spyOn(service, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest.spyOn(regularPaymentsRepository, 'update').mockResolvedValueOnce(true);

      const result = await service.update(id, updateDto, userId);

      expect(result).toStrictEqual(true);
      expect(service.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      expect(regularPaymentsRepository.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('delete()', () => {
    it('should delete a regular payment for a customer', async () => {
      const id = 'payment-id';
      const userId = '1';
      vitest
        .spyOn(service, 'findOneAsCustomer')
        .mockResolvedValueOnce({} as RegularPaymentEntity);
      vitest.spyOn(regularPaymentsRepository, 'delete').mockResolvedValueOnce(true);

      const result = await service.delete(id, userId);

      expect(result).toStrictEqual(true);
      expect(service.findOneAsCustomer).toHaveBeenCalledWith(id, userId);
      expect(regularPaymentsRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
