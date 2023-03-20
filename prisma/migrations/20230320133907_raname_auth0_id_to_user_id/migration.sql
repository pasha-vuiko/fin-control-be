/*
  Warnings:

  - You are about to drop the column `auth0Id` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_auth0Id_key";

-- AlterTable
ALTER TABLE "Customer" RENAME COLUMN "auth0Id" TO "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");
