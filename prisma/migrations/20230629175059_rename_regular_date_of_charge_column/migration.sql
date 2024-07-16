/*
  Warnings:

  - You are about to drop the column `scheduledData` on the `RegularPayment` table. All the data in the column will be lost.
  - Added the required column `dateOfCharge` to the `RegularPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegularPayment" DROP COLUMN "scheduledData";
ALTER TABLE "RegularPayment" ADD COLUMN     "dateOfCharge" TIMESTAMPTZ(6) NOT NULL;
