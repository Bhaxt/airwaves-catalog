import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "okkrep.com" },
      { protocol: "https", hostname: "www.okkrep.com" },
    ],
  },
};

export default nextConfig;
