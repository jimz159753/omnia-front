import { PrismaClient } from "../generated/prisma";
import { headers } from "next/headers";

const globalForPrisma = globalThis as unknown as {
  prismaManager: Map<string, PrismaClient>;
};

const prismaManager = globalForPrisma.prismaManager || new Map<string, PrismaClient>();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaManager = prismaManager;
}

function getTenantClient(tenantSlug: string): PrismaClient {
  if (!prismaManager.has(tenantSlug)) {
    const defaultUrl = process.env.DATABASE_URL;
    if (!defaultUrl) throw new Error("DATABASE_URL not set");

    let dbName = `omnia_tenant_${tenantSlug}`;
    if (tenantSlug === "dev" || tenantSlug === "localhost" || !tenantSlug) {
       dbName = "postgres"; 
    }

    try {
        const urlObj = new URL(defaultUrl);
        urlObj.pathname = `/${dbName}`;
        
        const client = new PrismaClient({
          datasources: {
            db: {
              url: urlObj.toString(),
            },
          },
          log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
        });
        
        prismaManager.set(tenantSlug, client);
    } catch (e) {
        console.error("Failed to construct tenant DB URL", e);
        throw e;
    }
  }
  return prismaManager.get(tenantSlug)!;
}

export async function getPrisma() {
    let tenantSlug = "dev";
    try {
        const heads = await headers();
        tenantSlug = heads.get("x-tenant-slug") || "dev";
    } catch (e) {
        // Fallback
    }
    return getTenantClient(tenantSlug);
}
