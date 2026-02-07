import { PrismaClient } from "../generated/prisma";
import { headers } from "next/headers";

const globalForPrisma = globalThis as unknown as {
  prismaManager: Map<string, PrismaClient>;
};

const prismaManager = globalForPrisma.prismaManager || new Map<string, PrismaClient>();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaManager = prismaManager;
}

/**
 * Get a Prisma client for a specific tenant.
 * This is the main function to use when you know the tenant slug.
 */
export function getPrismaForTenant(tenantSlug: string): PrismaClient {
  if (!prismaManager.has(tenantSlug)) {
    const defaultUrl = process.env.DATABASE_URL;
    if (!defaultUrl) throw new Error("DATABASE_URL not set");

    let dbName = `omnia_tenant_${tenantSlug}`;
    // For development/localhost, use the standard database name from the URL
    if (tenantSlug === "dev" || tenantSlug === "localhost" || !tenantSlug) {
      const urlObj = new URL(defaultUrl);
      dbName = urlObj.pathname.substring(1) || "postgres"; 
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
          log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        });
        
        prismaManager.set(tenantSlug, client);
    } catch (e) {
        console.error("Failed to construct tenant DB URL", e);
        throw e;
    }
  }
  return prismaManager.get(tenantSlug)!;
}

/**
 * Get a Prisma client using the tenant from request headers.
 * This is used when the tenant is resolved from middleware via x-tenant-slug header.
 */
export async function getPrisma() {
    let tenantSlug = "dev";
    try {
        const heads = await headers();
        tenantSlug = heads.get("x-tenant-slug") || "dev";
    } catch (e) {
        // Fallback
    }
    return getPrismaForTenant(tenantSlug);
}
