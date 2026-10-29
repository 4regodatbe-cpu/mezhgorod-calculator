import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { useTypeScriptCli: false },
  outputFileTracingIncludes: {
    "/r": ["./data/local-settlements/**"],
    "/api/suggest": ["./data/local-settlements/**"],
  },
};

export default nextConfig;
