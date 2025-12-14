-- CreateTable
CREATE TABLE IF NOT EXISTS "TicketProduct" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TicketService" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketProduct_ticketId_idx" ON "TicketProduct"("ticketId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketProduct_productId_idx" ON "TicketProduct"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketService_ticketId_idx" ON "TicketService"("ticketId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketService_serviceId_idx" ON "TicketService"("serviceId");

-- Migrate existing data from TicketItem to new tables (only if TicketItem exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'TicketItem') THEN
        -- Migrate products
        INSERT INTO "TicketProduct" ("id", "ticketId", "productId", "quantity", "unitPrice", "discount", "total", "createdAt", "updatedAt")
        SELECT "id", "ticketId", "productId", "quantity", "unitPrice", "discount", "total", "createdAt", "updatedAt"
        FROM "TicketItem"
        WHERE "productId" IS NOT NULL
        ON CONFLICT ("id") DO NOTHING;

        -- Migrate services
        INSERT INTO "TicketService" ("id", "ticketId", "serviceId", "quantity", "unitPrice", "discount", "total", "createdAt", "updatedAt")
        SELECT "id", "ticketId", "serviceId", "quantity", "unitPrice", "discount", "total", "createdAt", "updatedAt"
        FROM "TicketItem"
        WHERE "serviceId" IS NOT NULL
        ON CONFLICT ("id") DO NOTHING;

        -- Drop the old table
        DROP TABLE "TicketItem";
    END IF;
END $$;

-- AddForeignKey (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TicketProduct_ticketId_fkey'
    ) THEN
        ALTER TABLE "TicketProduct" ADD CONSTRAINT "TicketProduct_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TicketProduct_productId_fkey'
    ) THEN
        ALTER TABLE "TicketProduct" ADD CONSTRAINT "TicketProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TicketService_ticketId_fkey'
    ) THEN
        ALTER TABLE "TicketService" ADD CONSTRAINT "TicketService_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TicketService_serviceId_fkey'
    ) THEN
        ALTER TABLE "TicketService" ADD CONSTRAINT "TicketService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

