import { execSync } from "child_process";
import { PrismaClient } from "../generated/master-client";

const globalForPrisma = globalThis as unknown as {
  masterPrisma: PrismaClient | undefined;
};

export const masterPrisma = globalForPrisma.masterPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.masterPrisma = masterPrisma;

/**
 * Ensures a tenant database exists and has the schema applied.
 * In a development environment, this creates the DB and runs 'prisma db push'.
 */
export async function bootstrapTenantDatabase(tenantSlug: string) {
  const dbName = `omnia_tenant_${tenantSlug}`;
  
  try {
    // 1. Check if database exists by querying pg_database
    // We use the masterPrisma which is already connected to a valid DB
    const exists = await masterPrisma.$queryRawUnsafe<any[]>(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      dbName
    );

    if (exists.length === 0) {
      console.log(`[SaaS] Creating database: ${dbName}`);
      
      // CREATE DATABASE cannot be executed in a parameterized query or transaction
      // and needs to be a raw string. We sanitize the dbName by ensuring it's alphanumeric.
      const safeDbName = dbName.replace(/[^a-z0-9_]/g, "");
      await masterPrisma.$executeRawUnsafe(`CREATE DATABASE "${safeDbName}"`);
      
      console.log(`[SaaS] Running migrations for: ${safeDbName}`);
      
      // Get the base connection URL from env and swap the DB name
      const baseUrl = process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL;
      if (!baseUrl) throw new Error("MASTER_DATABASE_URL or DATABASE_URL not set");
      
      const urlObj = new URL(baseUrl);
      urlObj.pathname = `/${safeDbName}`;
      const tenantDbUrl = urlObj.toString();
      
      // Run prisma db push to sync the schema to the new DB
      // We use --accept-data-loss because it's a new DB and we want it to be fast
      execSync(`npx prisma db push --schema=prisma/schema.prisma --accept-data-loss`, {
        env: { ...process.env, DATABASE_URL: tenantDbUrl },
        stdio: "inherit"
      });
      
      console.log(`[SaaS] Database ${safeDbName} bootstrapped successfully.`);
    }
  } catch (error) {
    console.error(`[SaaS] Error bootstrapping database ${dbName}:`, error);
    // Don't throw if it already exists (race condition)
    if (error instanceof Error && error.message.includes("already exists")) {
       return;
    }
    throw error;
  }
}
