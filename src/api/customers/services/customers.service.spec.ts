import { plainToInstance } from 'class-transformer';
import { vitest } from 'vitest';

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { CustomerCreateDto } from '@api/customers/dto/customer-create.dto';
import { CustomerUpdateDto } from '@api/customers/dto/customer-update.dto';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { Sex } from '@api/customers/enums/sex.enum';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { CustomersService } from './customers.service';

const mockCustomerCreateDto = plainToInstance(CustomerCreateDto, {
  firstName: 'test',
  lastName: 'test',
  birthdate: new Date().toDateString(),
  phone: '123456789',
  sex: Sex.MALE,
});
const mockCustomerUpdateDto = plainToInstance(CustomerUpdateDto, {
  firstName: 'test',
  lastName: 'test',
  phone: '+38234902834',
});
const mockUser: IUser = {
  id: '1',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'test',
  lastName: 'test',
  name: 'test',
  nickname: 'test',
  roles: [Roles.CUSTOMER],
};
const mockCustomer: ICustomer = {
  id: '1',
  userId: '1',
  firstName: 'test',
  lastName: 'test',
  email: 'test@gmail.com',
  phone: '123456789',
  birthdate: new Date(),
  sex: Sex.MALE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// eslint-disable-next-line max-lines-per-function
describe('CustomerService', () => {
  let service: CustomersService;
  let customersRepository: CustomersRepository;

  beforeEach(async () => {
    // Preventing connection to the Redis
    vitest
      .spyOn(RedisConfigService, 'getIoRedisInstance')
      .mockReturnValue({} as IoredisWithDefaultTtl);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        CustomersRepository,
        { provide: DRIZZLE_CLIENT, useValue: {} },
      ],
    })
      .overrideProvider(CustomersRepository)
      .useValue(getMockedInstance(CustomersRepository))
      .compile();

    service = module.get<CustomersService>(CustomersService);
    customersRepository = module.get<CustomersRepository>(CustomersRepository);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany()', () => {
    it('should call findMany method of customersRepository', async () => {
      const pagination: PagePaginationDto = {
        page: 1,
        numOfItems: 1,
      };
      const customer = structuredClone(mockCustomer);
      const dbResponse: IPagePaginationOutput<ICustomer> = {
        items: [customer],
        total: 1,
      };
      vitest.spyOn(customersRepository, 'findMany').mockResolvedValue(dbResponse);

      const result = await service.findMany(pagination);
      const expectedResult = new PagePaginationOutputEntity<CustomerEntity>({
        items: [CustomerEntity.fromCustomerObj(customer)],
        total: dbResponse.total,
      });

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.findMany).toHaveBeenCalledWith(pagination);
    });
  });

  describe('findOneByIdAsAdmin()', () => {
    it('should call findOneById method of customersRepository and return found customer', async () => {
      const id = '1';
      const mockCustomerFromDb = structuredClone(mockCustomer);
      vitest
        .spyOn(customersRepository, 'findOneById')
        .mockResolvedValue(mockCustomerFromDb);

      const result = await service.findOneByIdAsAdmin(id);
      const expectedResult = CustomerEntity.fromCustomerObj(mockCustomerFromDb);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.findOneByIdAsAdmin(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByUserId()', () => {
    it('should call findOneByUserId method of customersRepository and return found customer', async () => {
      const userId = '1';
      // Mock found customer
      const foundCustomer = structuredClone(mockCustomer);
      vitest
        .spyOn(customersRepository, 'findOneByUserId')
        .mockResolvedValue(foundCustomer);

      const result = await service.findOneByUserId(userId);
      const expectedResult = CustomerEntity.fromCustomerObj(foundCustomer);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.findOneByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const userId = '1';
      vitest.spyOn(customersRepository, 'findOneByUserId').mockResolvedValue(null);

      await expect(service.findOneByUserId(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('should call create method of customersRepository with correct parameters', async () => {
      // Mock createCustomerDto
      const createCustomerDto = structuredClone(mockCustomerCreateDto);
      // Mock user
      const user = structuredClone(mockUser);
      // Mock expected result
      vitest.spyOn(customersRepository, 'create').mockResolvedValue(true);

      const result = await service.create(createCustomerDto, user);

      expect(result).toEqual(true);
      expect(customersRepository.create).toHaveBeenCalledWith({
        ...createCustomerDto,
        userId: '1',
        email: 'test@example.com',
      });
    });
  });

  describe('updateAsCustomer()', () => {
    it('should call findOneById method of customersRepository and update customer if found', async () => {
      const id = '1';
      const updateCustomerDto = structuredClone(mockCustomerUpdateDto);
      const userId = '1';
      const foundCustomer = structuredClone(mockCustomer);
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vitest.spyOn(customersRepository, 'update').mockResolvedValue(true);

      const result = await service.updateAsCustomer(id, updateCustomerDto, userId);

      expect(result).toStrictEqual(true);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.update).toHaveBeenCalledWith(id, updateCustomerDto);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const updateCustomerDto = structuredClone(mockCustomerUpdateDto);
      const userId = '2';
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(
        service.updateAsCustomer(id, updateCustomerDto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAsAdmin()', () => {
    it('should call findOneById method of customersRepository and update customer if found', async () => {
      const id = '1';
      const updateCustomerDto: CustomerUpdateDto = {};
      const foundCustomer = structuredClone(mockCustomer);
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vitest.spyOn(customersRepository, 'update').mockResolvedValue(true);

      const result = await service.updateAsAdmin(id, updateCustomerDto);

      expect(result).toStrictEqual(true);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.update).toHaveBeenCalledWith(id, updateCustomerDto);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const updateCustomerDto: CustomerUpdateDto = {}; // Mock updateCustomerDto
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.updateAsAdmin(id, updateCustomerDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeAsCustomer()', () => {
    it('should call findOneById method of customersRepository and remove customer if found and user is authorized', async () => {
      const id = '1';
      const userId = '1';
      const foundCustomer = structuredClone(mockCustomer); // Mock found customer
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vitest.spyOn(customersRepository, 'remove').mockResolvedValue(true);

      const result = await service.removeAsCustomer(id, userId);

      expect(result).toStrictEqual(true);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const userId = '2';
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.removeAsCustomer(id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized to delete customer', async () => {
      const id = '1';
      const userId = '2';
      const foundCustomer: ICustomer = {
        ...mockCustomer,
        userId: '3',
      };
      vitest.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);

      await expect(service.removeAsCustomer(id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('removeAsAdmin()', () => {
    it('should call remove method of customersRepository', async () => {
      const id = '1';
      vitest.spyOn(customersRepository, 'remove').mockResolvedValue(true);

      const result = await service.removeAsAdmin(id);

      expect(result).toEqual(true);
      expect(customersRepository.remove).toHaveBeenCalledWith(id);
    });
  });
});
