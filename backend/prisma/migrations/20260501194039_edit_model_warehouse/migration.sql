/*
  Warnings:

  - Added the required column `cell_square` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grid_cols` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grid_rows` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "cell_square" INTEGER NOT NULL,
ADD COLUMN     "grid_cols" INTEGER NOT NULL,
ADD COLUMN     "grid_rows" INTEGER NOT NULL;
