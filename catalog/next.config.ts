import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "f005.backblazeb2.com" },
    ],
  },
};

export default nextConfig;
