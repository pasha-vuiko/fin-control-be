import { Inject, Injectable } from '@nestjs/common';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IUserService } from '@shared/modules/auth/interfaces/user-service.interface';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { UserAuth0Service } from '@shared/modules/auth/services/user-auth0.service';
import { EmailVerificationFlowState } from '@shared/modules/email/enums/email-verification-flow-state.enum';
import { EmailVerificationNotStartedException } from '@shared/modules/email/exceptions/exception-classes';
import { IExpirationKeyValueStore } from '@shared/modules/email/interfaces/expiration-key-value-store.interface';
import { EmailVerificationService } from '@shared/modules/email/services/email-verification/email-verification.service';
import { SesEmailService } from '@shared/modules/email/services/ses-email/ses-email.service';
import { RedisService } from '@shared/modules/redis/services/redis/redis.service';

import { CustomerEntity } from '@api/customers/entities/customer.entity';
import {
  CustomerNotFoundException,
  ForbiddenToDeleteCustomerException,
} from '@api/customers/exceptions/exception-classes';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerUpdateDto } from '../dto/customer-update.dto';

@Injectable()
export class CustomersService {
  private readonly currentEmailVerificationService: EmailVerificationService;
  private readonly newEmailVerificationService: EmailVerificationService;

  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
    @Inject(UserAuth0Service) private userService: IUserService,
    emailService: SesEmailService,
    redisService: RedisService,
  ) {
    const emailVerificationServiceOptions: IExpirationKeyValueStore = {
      checkIfExists: async (cacheKey: string): Promise<boolean> =>
        await redisService.checkIfExists(cacheKey),
      set: async <T>(cacheKey: string, value: T, ttl: number): Promise<T> =>
        await redisService.set(cacheKey, value, ttl),
      update: async <T>(key: string, value: T): Promise<T> =>
        await redisService.update(key, value),
      get: async <T>(cacheKey: string): Promise<T | null> =>
        await redisService.get(cacheKey),
      delete: async (cacheKey: string): Promise<boolean> =>
        await redisService.delete(cacheKey),
    };

    this.currentEmailVerificationService = new EmailVerificationService({
      emailService,
      emailSubject: 'Email Change Verification',
      verificationFlowTag: 'currentEmailForChange',
      expirationStore: emailVerificationServiceOptions,
    });
    this.newEmailVerificationService = new EmailVerificationService({
      emailService,
      emailSubject: 'Email Change Verification',
      verificationFlowTag: 'newEmailForChange',
      expirationStore: emailVerificationServiceOptions,
    });
  }

  async findMany(
    pagination: PagePaginationDto,
  ): Promise<PagePaginationOutputEntity<CustomerEntity>> {
    const { items, total } = await this.customerRepository.findMany(pagination);

    return new PagePaginationOutputEntity<CustomerEntity>({
      items: items.map(CustomerEntity.fromCustomerObj),
      total,
    });
  }

  async findOneByIdAsAdmin(id: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return CustomerEntity.fromCustomerObj(foundCustomer);
  }

  async findOneByUserId(userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneByUserId(userId);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return CustomerEntity.fromCustomerObj(foundCustomer);
  }

  async create(
    createCustomerDto: CustomerCreateDto,
    user: IUser,
  ): Promise<CustomerEntity> {
    const { id, email } = user;

    const createdCustomer = await this.customerRepository.create({
      ...createCustomerDto,
      birthdate: new Date(createCustomerDto.birthdate),
      userId: id,
      email,
    });

    return CustomerEntity.fromCustomerObj(createdCustomer);
  }

  async updateAsCustomer(
    id: string,
    updateCustomerDto: CustomerUpdateDto,
    userId: string,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer || foundCustomer.userId !== userId) {
      throw new CustomerNotFoundException();
    }

    return await this.customerRepository
      .update(id, updateCustomerDto)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async updateAsAdmin(
    id: string,
    updateCustomerDto: CustomerUpdateDto,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return await this.customerRepository
      .update(id, updateCustomerDto)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async removeAsCustomer(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    if (foundCustomer.userId !== userId) {
      throw new ForbiddenToDeleteCustomerException();
    }

    return await this.customerRepository
      .remove(id)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async removeAsAdmin(id: string): Promise<CustomerEntity> {
    return await this.customerRepository
      .remove(id)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  // TODO Rethrow errors with flow specific ones
  async sendVerificationCodeToCurrentEmailForChange(userId: string): Promise<boolean> {
    const { email } = await this.findOneByUserId(userId);

    return await this.currentEmailVerificationService.start(userId, email);
  }

  async resendVerificationCodeToCurrentEmailForChange(userId: string): Promise<boolean> {
    return await this.currentEmailVerificationService.resendCode(userId);
  }

  async verifyCurrentEmailForChange(userId: string, code: string): Promise<boolean> {
    return await this.currentEmailVerificationService.verify(userId, Number(code));
  }

  async sendVerificationCodeToNewEmailForChange(
    userId: string,
    newEmail: string,
  ): Promise<boolean> {
    await this.checkIfCurrentEmailIsVerified(userId);

    return await this.newEmailVerificationService.start(userId, newEmail);
  }

  async resendVerificationCodeToNewEmailForChange(userId: string): Promise<boolean> {
    await this.checkIfCurrentEmailIsVerified(userId);

    return await this.newEmailVerificationService.resendCode(userId);
  }

  async changeCustomerEmail(userId: string, code: string): Promise<boolean> {
    await this.checkIfCurrentEmailIsVerified(userId);

    await this.newEmailVerificationService.verify(userId, Number(code));

    const newEmail = await this.newEmailVerificationService.getEmail(userId);

    await this.customerRepository.updateEmail(userId, newEmail);
    await this.userService.updateEmail(userId, newEmail).catch(async err => {
      // Reverting changes in DB in case of error
      const currentEmail = await this.currentEmailVerificationService.getEmail(userId);
      await this.customerRepository.updateEmail(userId, currentEmail);

      throw err;
    });

    await this.currentEmailVerificationService.resetFlow(userId);
    await this.newEmailVerificationService.resetFlow(userId);

    return true;
  }

  private async checkIfCurrentEmailIsVerified(userId: string): Promise<boolean> {
    const currentEmailVerificationState =
      await this.currentEmailVerificationService.getState(userId);

    if (currentEmailVerificationState !== EmailVerificationFlowState.VERIFIED) {
      // TODO Replace with flow specific exception
      throw new EmailVerificationNotStartedException('Current email is not verified');
    }

    return true;
  }
}
