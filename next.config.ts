import type { NextConfig } from "next";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return [
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-icon",
      },
    ];
  },
};

export default nextConfig;
