-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "color" TEXT;

-- CreateTable
CREATE TABLE "warehouse_blocks" (
    "id" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_blocks_warehouse_id_label_key" ON "warehouse_blocks"("warehouse_id", "label");

-- AddForeignKey
ALTER TABLE "warehouse_blocks" ADD CONSTRAINT "warehouse_blocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
