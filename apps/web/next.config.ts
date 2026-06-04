import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@wordsort/game-logic"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack(config: any) {
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        ".js": [".ts", ".tsx", ".js", ".jsx"],
        ".mjs": [".mts", ".mjs"],
      },
    };
    return config;
  },
};

export default nextConfig;
