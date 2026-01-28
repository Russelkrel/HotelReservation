-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "lastModifiedDate" TIMESTAMP(3),
ADD COLUMN     "modificationCount" INTEGER NOT NULL DEFAULT 0;
