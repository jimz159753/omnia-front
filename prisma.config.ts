import { defineConfig, env } from "prisma";

export default defineConfig({
  datasources: {
    db: {
      provider: "postgresql",
      url: env("DATABASE_URL"),
    },
  },
});

