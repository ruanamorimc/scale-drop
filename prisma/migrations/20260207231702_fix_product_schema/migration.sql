/*
  Warnings:

  - A unique constraint covering the columns `[externalId,provider,userId]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalLink" TEXT,
ADD COLUMN     "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "storeName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_externalId_provider_userId_key" ON "product"("externalId", "provider", "userId");
