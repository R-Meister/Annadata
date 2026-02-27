import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Service API rewrites — route frontend API calls to backend services
  async rewrites() {
    return [
      {
        source: "/api/msp-mitra/:path*",
        destination: `${process.env.NEXT_PUBLIC_MSP_MITRA_URL || "http://localhost:8001"}/:path*`,
      },
      {
        source: "/api/soilscan/:path*",
        destination: `${process.env.NEXT_PUBLIC_SOILSCAN_URL || "http://localhost:8002"}/:path*`,
      },
      {
        source: "/api/fasal-rakshak/:path*",
        destination: `${process.env.NEXT_PUBLIC_FASAL_RAKSHAK_URL || "http://localhost:8003"}/:path*`,
      },
      {
        source: "/api/jal-shakti/:path*",
        destination: `${process.env.NEXT_PUBLIC_JAL_SHAKTI_URL || "http://localhost:8004"}/:path*`,
      },
      {
        source: "/api/harvest-shakti/:path*",
        destination: `${process.env.NEXT_PUBLIC_HARVEST_SHAKTI_URL || "http://localhost:8005"}/:path*`,
      },
      {
        source: "/api/kisaan-sahayak/:path*",
        destination: `${process.env.NEXT_PUBLIC_KISAAN_SAHAYAK_URL || "http://localhost:8006"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
