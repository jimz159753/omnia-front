import { PrismaClient } from "../generated/master-client";

const globalForPrisma = globalThis as unknown as {
  masterPrisma: PrismaClient | undefined;
};

export const masterPrisma = globalForPrisma.masterPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.masterPrisma = masterPrisma;
