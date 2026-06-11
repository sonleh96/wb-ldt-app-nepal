import type { NextConfig } from "next";

const analyticsFallbackFiles = [
  "./src/generated/analytics-data.json",
  "./src/generated/zambia/analytics-data.json",
  "./src/generated/serbia/analytics-data.json",
  "./public/data/nepal-municipalities.geojson",
  "./public/data/zambia/municipalities.geojson",
  "./public/data/serbia/municipalities.geojson",
];

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
    "/nepal": analyticsFallbackFiles,
    "/zambia": analyticsFallbackFiles,
    "/serbia": analyticsFallbackFiles,
    "/[country]/analytics": analyticsFallbackFiles,
    "/api/ai/province-plan-context": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
    "/api/ai/national-plan-context": [
      "./node_modules/@napi-rs/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
