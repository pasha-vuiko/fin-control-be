-- CreateTable
CREATE TABLE "UserData" (
    "id" STRING NOT NULL,
    "auth0Id" STRING NOT NULL,
    "email" STRING NOT NULL,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserData_email_key" ON "UserData"("email");
