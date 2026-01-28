import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  /* config options here */
  // Externaliza módulos Node.js para evitar bundle no cliente
  // Isso garante que o Prisma Client só seja usado no servidor
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],

  // Configuração do Turbopack (Next.js 16+)
  turbopack: {
    // Externaliza o Prisma Client no Turbopack também
  },

  // Configuração do Webpack (fallback caso não use Turbopack)
  webpack: (config, { isServer }) => {
    // Garante que o Prisma Client só roda no servidor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
      };

      // Externaliza o Prisma Client do bundle do cliente
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
        "@/generated/prisma/client": "commonjs @prisma/client",
      });
    }
    return config;
  },
};

export default nextConfig;
