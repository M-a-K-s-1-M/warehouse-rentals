/*
  Warnings:

  - You are about to drop the column `price` on the `warehouses` table. All the data in the column will be lost.
  - Added the required column `area_square` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `col_end` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `col_start` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_cell` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row_end` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row_start` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_cells` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_cell` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "area_square" INTEGER NOT NULL,
ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "col_end" INTEGER NOT NULL,
ADD COLUMN     "col_start" INTEGER NOT NULL,
ADD COLUMN     "extra_contact_email" TEXT,
ADD COLUMN     "extra_contact_name" TEXT,
ADD COLUMN     "price_per_cell" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "row_end" INTEGER NOT NULL,
ADD COLUMN     "row_start" INTEGER NOT NULL,
ADD COLUMN     "total_cells" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" DROP COLUMN "price",
ADD COLUMN     "price_per_cell" DOUBLE PRECISION NOT NULL;
