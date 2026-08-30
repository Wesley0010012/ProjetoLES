import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org" }],
  },
  env: {
    NEXT_PUBLIC_AUTH_MODE: "mock",
  },
};

export default nextConfig;
