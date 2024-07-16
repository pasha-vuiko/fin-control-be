/*
  Warnings:

  - You are about to drop the `UserData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UserData";

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "auth0Id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_auth0Id_key" ON "Customer"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
