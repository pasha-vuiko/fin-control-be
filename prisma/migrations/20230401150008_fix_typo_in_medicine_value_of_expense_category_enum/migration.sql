/*
  Warnings:

  - The values [MEDECINE] on the enum `ExpenseCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ExpenseCategory"ADD VALUE 'MEDICINE';
ALTER TYPE "ExpenseCategory"DROP VALUE 'MEDECINE';
