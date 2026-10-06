import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/printlab",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
