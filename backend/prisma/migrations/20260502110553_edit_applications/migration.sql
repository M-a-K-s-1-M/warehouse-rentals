-- CreateEnum
CREATE TYPE "ApplicationOpenStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "open_status" "ApplicationOpenStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "application_engineers" (
    "application_id" TEXT NOT NULL,
    "engineer_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_engineers_pkey" PRIMARY KEY ("application_id","engineer_id")
);

-- CreateIndex
CREATE INDEX "application_engineers_engineer_id_idx" ON "application_engineers"("engineer_id");

-- AddForeignKey
ALTER TABLE "application_engineers" ADD CONSTRAINT "application_engineers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_engineers" ADD CONSTRAINT "application_engineers_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
