import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Handle connection errors
prisma
  .$connect()
  .then(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Database connected successfully");
    }
  })
  .catch((error: Error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

export default prisma;
