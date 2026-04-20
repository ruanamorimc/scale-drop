/*
  Warnings:

  - The values [SHOPEE] on the enum `StorePlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StorePlatform_new" AS ENUM ('SHOPIFY', 'MERCADO_LIVRE', 'NUVEMSHOP');
ALTER TABLE "store_integration" ALTER COLUMN "platform" TYPE "StorePlatform_new" USING ("platform"::text::"StorePlatform_new");
ALTER TYPE "StorePlatform" RENAME TO "StorePlatform_old";
ALTER TYPE "StorePlatform_new" RENAME TO "StorePlatform";
DROP TYPE "public"."StorePlatform_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "metaAccessToken" TEXT;

-- CreateTable
CREATE TABLE "meta_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_pixel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'meta',
    "pixelIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "rules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_pixel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meta_account_userId_idx" ON "meta_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meta_account_userId_accountId_key" ON "meta_account"("userId", "accountId");

-- CreateIndex
CREATE INDEX "meta_pixel_userId_idx" ON "meta_pixel"("userId");

-- AddForeignKey
ALTER TABLE "meta_account" ADD CONSTRAINT "meta_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_pixel" ADD CONSTRAINT "meta_pixel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
