/*
  Warnings:

  - The `plan` column on the `subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[workspaceId,platform,storeId]` on the table `store_integration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `store_integration` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `platform` on the `store_integration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'START', 'SCALE', 'PRO');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('SHOPIFY', 'MERCADO_LIVRE', 'NUVEMSHOP', 'YAMPI', 'CARTPANDA', 'KIWIFY', 'HOTMART', 'KIRVANO', 'APPMAX', 'MERCADO_PAGO', 'STRIPE', 'PAGARME', 'SHOPIFY_PAYMENTS', 'FACEBOOK_ADS', 'GOOGLE_ADS', 'TIKTOK_ADS', 'MELHOR_ENVIO');

-- DropIndex
DROP INDEX "store_integration_userId_platform_storeId_key";

-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "FixedExpense" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "gatewayFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "keyword" TEXT,
ADD COLUMN     "marketingCost" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "src" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "store_integration" ADD COLUMN     "publicKey" TEXT,
ADD COLUMN     "workspaceId" TEXT NOT NULL,
DROP COLUMN "platform",
ADD COLUMN     "platform" "IntegrationProvider" NOT NULL,
ALTER COLUMN "storeId" DROP NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "plan",
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiresAt" TIMESTAMP(3),
DROP COLUMN "plan",
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';

-- DropEnum
DROP TYPE "StorePlatform";

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_pixel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'google',
    "pixelIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "rules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_pixel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_userId_idx" ON "workspaces"("userId");

-- CreateIndex
CREATE INDEX "google_account_userId_idx" ON "google_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "google_account_userId_accountId_key" ON "google_account"("userId", "accountId");

-- CreateIndex
CREATE INDEX "google_pixel_userId_idx" ON "google_pixel"("userId");

-- CreateIndex
CREATE INDEX "tracking_events_orderId_idx" ON "tracking_events"("orderId");

-- CreateIndex
CREATE INDEX "Fee_workspaceId_idx" ON "Fee"("workspaceId");

-- CreateIndex
CREATE INDEX "FixedExpense_workspaceId_idx" ON "FixedExpense"("workspaceId");

-- CreateIndex
CREATE INDEX "Tax_workspaceId_idx" ON "Tax"("workspaceId");

-- CreateIndex
CREATE INDEX "store_integration_workspaceId_idx" ON "store_integration"("workspaceId");

-- CreateIndex
CREATE INDEX "store_integration_platform_idx" ON "store_integration"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "store_integration_workspaceId_platform_storeId_key" ON "store_integration"("workspaceId", "platform", "storeId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_integration" ADD CONSTRAINT "store_integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_account" ADD CONSTRAINT "google_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_pixel" ADD CONSTRAINT "google_pixel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
