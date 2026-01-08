/*
  Warnings:

  - You are about to drop the column `dmageUrl` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `iescription` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "dmageUrl",
DROP COLUMN "iescription",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT;
