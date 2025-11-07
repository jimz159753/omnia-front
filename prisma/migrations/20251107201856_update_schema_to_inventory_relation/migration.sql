/*
  Warnings:

  - You are about to drop the column `productId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inventoryId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropIndex
DROP INDEX "public"."Order_productId_key";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "productId",
ADD COLUMN     "inventoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."OrderItem";

-- CreateIndex
CREATE UNIQUE INDEX "Order_inventoryId_key" ON "public"."Order"("inventoryId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
