-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FOOD', 'CLOTHES', 'HOBBIES', 'GAMES', 'SUBSCRIPTIONS', 'OTHER');

-- CreateTable
CREATE TABLE "Expense" (
    "id" STRING NOT NULL,
    "customerId" STRING NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ExpenseType" NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
