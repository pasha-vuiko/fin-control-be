/*
  Warnings:

  - You are about to drop the `RegulatPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegulatPayment" DROP CONSTRAINT "RegulatPayment_customerId_fkey";

-- DropTable
DROP TABLE "RegulatPayment";

-- CreateTable
CREATE TABLE "RegularPayment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "scheduledData" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "ExpenseCategory" NOT NULL,

    CONSTRAINT "RegularPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegularPayment" ADD CONSTRAINT "RegularPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
