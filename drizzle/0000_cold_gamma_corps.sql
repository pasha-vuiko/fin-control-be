-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

DO $$ BEGIN
 CREATE TYPE "public"."ExpenseCategory" AS ENUM('FOOD', 'CLOTHES', 'SUBSCRIPTIONS', 'OTHER', 'MEDICINE', 'UTILITY_PAYMENTS', 'ANIMALS', 'PLACES_TO_EAT', 'EDUCATION', 'BOOKS', 'TAXI', 'GIFTS', 'DONATIONS', 'MOBILE_SERVICES', 'SPORTS', 'ENTERTAINMENT', 'BEAUTY_AND_CARE', 'HOUSEHOLD', 'PUBLIC_TRANSPORT', 'TRAVEL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Sex" AS ENUM('MALE', 'FEMALE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Customer" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"birthdate" timestamp(6) with time zone NOT NULL,
	"sex" "Sex" NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RegularPayment" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"category" "ExpenseCategory" NOT NULL,
	"dateOfCharge" timestamp(6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Expense" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp(6) with time zone NOT NULL,
	"category" "ExpenseCategory" NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RegularPayment" ADD CONSTRAINT "RegularPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Expense" ADD CONSTRAINT "Expense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer" USING btree (email text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer" USING btree (phone text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_userId_key" ON "Customer" USING btree (userId text_ops);
