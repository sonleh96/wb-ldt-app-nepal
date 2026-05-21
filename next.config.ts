import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pim-pam.net",
      },
    ],
  },
};

export default nextConfig;
