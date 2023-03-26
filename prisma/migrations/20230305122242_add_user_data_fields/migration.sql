/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `UserData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `UserData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthdate` to the `UserData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `UserData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `UserData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `UserData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `UserData` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "UserData" ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL;
ALTER TABLE "UserData" ADD COLUMN     "firstName" STRING NOT NULL;
ALTER TABLE "UserData" ADD COLUMN     "lastName" STRING NOT NULL;
ALTER TABLE "UserData" ADD COLUMN     "phone" STRING NOT NULL;
ALTER TABLE "UserData" ADD COLUMN     "sex" "Sex" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserData_auth0Id_key" ON "UserData"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_phone_key" ON "UserData"("phone");
