import { Sex } from '@prisma-definitions/client/client';
import { vitest } from 'vitest';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { Roles } from '@shared/modules/auth/enums/roles';
import { User as UserType } from '@shared/modules/auth/interfaces/user.interface';

import { CustomerCreateDto } from '@api/domain/customers/dto/customer-create.dto';
import { CustomerUpdateDto } from '@api/domain/customers/dto/customer-update.dto';
import { CustomerEntity } from '@api/domain/customers/entities/customer.entity';
import {
  CustomerNotFoundException,
  ForbiddenToDeleteCustomerException,
} from '@api/domain/customers/exceptions/exception-classes';
import { ICustomer } from '@api/domain/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/domain/customers/interfaces/customers.repository.interface';
import { CustomersRepository } from '@api/domain/customers/repositories/customers.repository';

import { getMockedInstance } from '../../../../../test/utils/get-mocked-instance.util';
import { CustomersService } from './customers.service';

const mockCustomerCreateDto: CustomerCreateDto = {
  firstName: 'test',
  lastName: 'test',
  birthdate: new Date().toDateString(),
  phone: '123456789',
  sex: Sex.MALE,
};
const mockCustomerUpdateDto: CustomerUpdateDto = {
  firstName: 'test',
  lastName: 'test',
  phone: '+38234902834',
};
const mockUser: UserType = {
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
  let customersRepository: ICustomersRepository;

  beforeEach(async () => {
    customersRepository = getMockedInstance(CustomersRepository);
    service = new CustomersService(customersRepository);
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
      vi.spyOn(customersRepository, 'findMany').mockResolvedValue(dbResponse);

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
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.findOneByIdAsAdmin(id)).rejects.toThrow(
        CustomerNotFoundException,
      );
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
      vi.spyOn(customersRepository, 'findOneByUserId').mockResolvedValue(null);

      await expect(service.findOneByUserId(userId)).rejects.toThrow(
        CustomerNotFoundException,
      );
    });
  });

  describe('create()', () => {
    it('should call create method of customersRepository with correct parameters', async () => {
      // Mock createCustomerDto
      const createCustomerDto = structuredClone(mockCustomerCreateDto);
      // Mock user
      const user = structuredClone(mockUser);
      // Mock expected result
      const customer = structuredClone(mockCustomer);
      vi.spyOn(customersRepository, 'create').mockResolvedValue(customer);

      const result = await service.create(createCustomerDto, user);
      const expectedResult = CustomerEntity.fromCustomerObj(customer);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.create).toHaveBeenCalledWith({
        ...createCustomerDto,
        birthdate: expect.any(Date), // Assuming createCustomerDto contains birthdate
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
      // @ts-expect-error types of birthdate from foundCustomer and updateCustomerDto are not compatible (string to string|Date)
      const updatedCustomer: ICustomer = {
        ...foundCustomer,
        ...updateCustomerDto,
      };
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vi.spyOn(customersRepository, 'update').mockResolvedValue(updatedCustomer);

      const result = await service.updateAsCustomer(id, updateCustomerDto, userId);
      const expectedReseult = CustomerEntity.fromCustomerObj(updatedCustomer);

      expect(result).toStrictEqual(expectedReseult);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.update).toHaveBeenCalledWith(id, updateCustomerDto);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const updateCustomerDto = structuredClone(mockCustomerUpdateDto);
      const userId = '2';
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(
        service.updateAsCustomer(id, updateCustomerDto, userId),
      ).rejects.toThrow(CustomerNotFoundException);
    });
  });

  describe('updateAsAdmin()', () => {
    it('should call findOneById method of customersRepository and update customer if found', async () => {
      const id = '1';
      const updateCustomerDto: CustomerUpdateDto = {};
      const foundCustomer = structuredClone(mockCustomer);
      // @ts-expect-error types of birthdate from foundCustomer and updateCustomerDto are not compatible (string to string|Date)
      const updatedCustomer: ICustomer = {
        ...foundCustomer,
        ...updateCustomerDto,
      };
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vi.spyOn(customersRepository, 'update').mockResolvedValue(updatedCustomer);

      const result = await service.updateAsAdmin(id, updateCustomerDto);
      const expectedResult = CustomerEntity.fromCustomerObj(updatedCustomer);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.update).toHaveBeenCalledWith(id, updateCustomerDto);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const updateCustomerDto: CustomerUpdateDto = {}; // Mock updateCustomerDto
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.updateAsAdmin(id, updateCustomerDto)).rejects.toThrow(
        CustomerNotFoundException,
      );
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('removeAsCustomer()', () => {
    it('should call findOneById method of customersRepository and remove customer if found and user is authorized', async () => {
      const id = '1';
      const userId = '1';
      const foundCustomer = structuredClone(mockCustomer); // Mock found customer
      const removedCustomer = structuredClone(mockCustomer); // Mock removed customer
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);
      vi.spyOn(customersRepository, 'remove').mockResolvedValue(removedCustomer);

      const result = await service.removeAsCustomer(id, userId);
      const expectedResult = CustomerEntity.fromCustomerObj(removedCustomer);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.findOneById).toHaveBeenCalledWith(id);
      expect(customersRepository.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const id = '1';
      const userId = '2';
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.removeAsCustomer(id, userId)).rejects.toThrow(
        CustomerNotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized to delete customer', async () => {
      const id = '1';
      const userId = '2';
      const foundCustomer: ICustomer = {
        ...mockCustomer,
        userId: '3',
      };
      vi.spyOn(customersRepository, 'findOneById').mockResolvedValue(foundCustomer);

      await expect(service.removeAsCustomer(id, userId)).rejects.toThrow(
        ForbiddenToDeleteCustomerException,
      );
    });
  });

  describe('removeAsAdmin()', () => {
    it('should call remove method of customersRepository', async () => {
      const id = '1';
      const removedCustomer = structuredClone(mockCustomer);
      vi.spyOn(customersRepository, 'remove').mockResolvedValue(removedCustomer);

      const result = await service.removeAsAdmin(id);
      const expectedResult = CustomerEntity.fromCustomerObj(removedCustomer);

      expect(result).toStrictEqual(expectedResult);
      expect(customersRepository.remove).toHaveBeenCalledWith(id);
    });
  });
});
