import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';
import { IUpdateExpenseInput } from '@api/expenses/interfaces/update-expense-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { Expense, Prisma } from '../../../../prisma/client';
import ExpenseCreateInput = Prisma.ExpenseCreateInput;

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(private prismaService: PrismaService) {}

  async findMany(): Promise<IExpense[]> {
    const foundExpenses = await this.prismaService.expense.findMany();

    return foundExpenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  async findManyByCustomer(customerId: string): Promise<IExpense[]> {
    const foundExpenses = await this.prismaService.expense.findMany({
      where: {
        customerId,
      },
    });

    return foundExpenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  async findOne(id: string): Promise<IExpense | null> {
    const foundExpense = await this.prismaService.expense.findUnique({ where: { id } });

    if (!foundExpense) {
      return null;
    }

    return this.mapExpenseFromPrismaToExpense(foundExpense);
  }

  async create(data: ICreateExpenseInput): Promise<IExpense> {
    const prismaCreateExpenseInput: ExpenseCreateInput = {
      ...data,
      customer: {
        connect: { id: data.customerId },
      },
    };

    const createdExpense = await this.prismaService.expense.create({
      data: prismaCreateExpenseInput,
    });

    return this.mapExpenseFromPrismaToExpense(createdExpense);
  }

  async update(id: string, data: IUpdateExpenseInput): Promise<IExpense> {
    const updatedExpense = await this.prismaService.expense.update({
      data,
      where: { id },
    });

    return this.mapExpenseFromPrismaToExpense(updatedExpense);
  }

  async delete(id: string): Promise<IExpense> {
    const deletedExpense = await this.prismaService.expense.delete({ where: { id } });

    return this.mapExpenseFromPrismaToExpense(deletedExpense);
  }

  private mapExpenseFromPrismaToExpense(expense: Expense): IExpense {
    return {
      id: expense.id,
      customerId: expense.customerId,
      date: expense.date,
      amount: expense.amount.toNumber(),
      type: expense.type,
    };
  }
}
