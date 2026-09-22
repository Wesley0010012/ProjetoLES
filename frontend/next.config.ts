import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }];
  },
};

export default nextConfig;
