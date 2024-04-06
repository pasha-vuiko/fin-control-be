/*
  Warnings:

  - The values [HOBBIES,GAMES] on the enum `ExpenseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ExpenseType" ADD VALUE 'MEDICINE';
ALTER TYPE "ExpenseType" ADD VALUE 'UTILITY_PAYMENTS';
ALTER TYPE "ExpenseType" ADD VALUE 'ANIMALS';
ALTER TYPE "ExpenseType" ADD VALUE 'PLACES_TO_EAT';
ALTER TYPE "ExpenseType" ADD VALUE 'EDUCATION';
ALTER TYPE "ExpenseType" ADD VALUE 'BOOKS';
ALTER TYPE "ExpenseType" ADD VALUE 'TAXI';
ALTER TYPE "ExpenseType" ADD VALUE 'GIFTS';
ALTER TYPE "ExpenseType" ADD VALUE 'DONATIONS';
ALTER TYPE "ExpenseType" ADD VALUE 'MOBILE_SERVICES';
ALTER TYPE "ExpenseType" ADD VALUE 'SPORTS';
ALTER TYPE "ExpenseType" ADD VALUE 'ENTERTAINMENT';
ALTER TYPE "ExpenseType" ADD VALUE 'BEAUTY_AND_CARE';
ALTER TYPE "ExpenseType" ADD VALUE 'HOUSEHOLD';
ALTER TYPE "ExpenseType" ADD VALUE 'PUBLIC_TRANSPORT';
ALTER TYPE "ExpenseType" ADD VALUE 'TRAVEL';
