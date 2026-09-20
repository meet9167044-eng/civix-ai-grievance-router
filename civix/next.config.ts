import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large image uploads via API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Images — allow Supabase storage and Nominatim
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "nominatim.openstreetmap.org",
      },
    ],
  },
};

export default nextConfig;
