import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import { IUpdateCustomerInput } from '@api/customers/interfaces/update-customer-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  findMany(): Promise<ICustomer[]> {
    return this.prismaService.customer.findMany();
  }

  findOne(id: string): Promise<ICustomer | null> {
    return this.prismaService.customer.findUnique({ where: { id } });
  }

  create(data: ICreateCustomerInput): Promise<ICustomer> {
    return this.prismaService.customer.create({ data });
  }

  update(id: string, data: IUpdateCustomerInput): Promise<ICustomer> {
    return this.prismaService.customer.update({ data, where: { id } });
  }

  remove(id: string): Promise<ICustomer> {
    return this.prismaService.customer.delete({ where: { id } });
  }
}
