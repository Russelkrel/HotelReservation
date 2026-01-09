-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "cancellationDate" TIMESTAMP(3),
ADD COLUMN     "refundAmount" DOUBLE PRECISION;
