/*
  Warnings:

  - The `createdAt` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `birthdate` on the `Customer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- AlterTable
ALTER TABLE "Customer"
    ALTER COLUMN "birthdate" TYPE TIMESTAMPTZ(6),
    ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
    ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

ALTER TABLE "Expense"
    ALTER COLUMN "date" TYPE TIMESTAMPTZ(6),
    ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
    ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);
