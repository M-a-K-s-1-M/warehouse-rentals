/*
  Warnings:

  - The primary key for the `warehouses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `warehouses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `warehouse_id` on the `applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `warehouse_id` on the `rentals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "rentals" DROP CONSTRAINT "rentals_warehouse_id_fkey";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "warehouse_id",
ADD COLUMN     "warehouse_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "warehouse_id",
ADD COLUMN     "warehouse_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
