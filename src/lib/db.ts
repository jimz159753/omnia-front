import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
        errorFormat: "pretty",
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }

    // Handle connection errors only when actually connecting
    prismaInstance
      .$connect()
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Database connected successfully");
        }
      })
      .catch((error: Error) => {
        console.error("❌ Database connection failed:", error);
        // Don't exit during build time
        if (process.env.NODE_ENV !== "production") {
          process.exit(1);
        }
      });
  }
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  },
});

// Graceful shutdown
process.on("beforeExit", async () => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
  }
});

export default prisma;
