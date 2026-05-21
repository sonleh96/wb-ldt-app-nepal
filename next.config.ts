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
  outputFileTracingIncludes: {
    "/api/ai/province-plan-context/route": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
    "/api/ai/national-plan-context/route": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
