import withNextIntl from "next-intl/plugin";
import type { NextConfig } from "next";

// Vinculas el plugin a tu archivo de configuración.
const withIntl = withNextIntl("./next-intl.config.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

// Exportas el plugin envolviendo tu configuración
export default withIntl(nextConfig);
