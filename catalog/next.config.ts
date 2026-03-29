import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "f005.backblazeb2.com" },
      { protocol: "https", hostname: "www.okkrep.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days
    deviceSizes: [390, 768, 1024],
    imageSizes: [128, 256],
  },
};

export default nextConfig;
