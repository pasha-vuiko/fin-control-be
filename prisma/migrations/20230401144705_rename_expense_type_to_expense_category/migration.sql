/*
  Warnings:

  - Changed the type of `type` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- RenameEnum
ALTER TYPE "ExpenseType" RENAME TO "ExpenseCategory";
