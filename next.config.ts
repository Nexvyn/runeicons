import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { hostname: "i.pinimg.com" },
    ],
  },
  async rewrites() {
    return [
      // Forward legacy iOS apple-touch-icon probes to the dynamic
      // app/apple-icon.tsx route so they don't 404 on first request
      // (before Safari has read the <link rel="apple-touch-icon"> tag).
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-icon",
      },
    ];
  },
};

export default nextConfig;
