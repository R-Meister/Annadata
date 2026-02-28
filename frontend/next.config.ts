import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Service API rewrites — route frontend API calls to backend services
  async rewrites() {
    return [
      // Auth routes — proxied to MSP Mitra (all services share the same auth)
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_MSP_MITRA_URL || "http://msp-mitra:8001"}/auth/:path*`,
      },
      {
        source: "/api/msp-mitra/:path*",
        destination: `${process.env.NEXT_PUBLIC_MSP_MITRA_URL || "http://msp-mitra:8001"}/:path*`,
      },
      {
        source: "/api/soilscan/:path*",
        destination: `${process.env.NEXT_PUBLIC_SOILSCAN_URL || "http://soilscan-ai:8002"}/:path*`,
      },
      {
        source: "/api/fasal-rakshak/:path*",
        destination: `${process.env.NEXT_PUBLIC_FASAL_RAKSHAK_URL || "http://fasal-rakshak:8003"}/:path*`,
      },
      {
        source: "/api/jal-shakti/:path*",
        destination: `${process.env.NEXT_PUBLIC_JAL_SHAKTI_URL || "http://jal-shakti:8004"}/:path*`,
      },
      {
        source: "/api/harvest-shakti/:path*",
        destination: `${process.env.NEXT_PUBLIC_HARVEST_SHAKTI_URL || "http://harvest-shakti:8005"}/:path*`,
      },
      {
        source: "/api/kisaan-sahayak/:path*",
        destination: `${process.env.NEXT_PUBLIC_KISAAN_SAHAYAK_URL || "http://kisaan-sahayak:8006"}/:path*`,
      },
      {
        source: "/api/protein-engineering/:path*",
        destination: `${process.env.NEXT_PUBLIC_PROTEIN_ENGINEERING_URL || "http://protein-engineering:8007"}/:path*`,
      },
      {
        source: "/api/kisan-credit/:path*",
        destination: `${process.env.NEXT_PUBLIC_KISAN_CREDIT_URL || "http://kisan-credit:8008"}/:path*`,
      },
      {
        source: "/api/harvest-to-cart/:path*",
        destination: `${process.env.NEXT_PUBLIC_HARVEST_TO_CART_URL || "http://harvest-to-cart:8009"}/:path*`,
      },
      {
        source: "/api/beej-suraksha/:path*",
        destination: `${process.env.NEXT_PUBLIC_BEEJ_SURAKSHA_URL || "http://beej-suraksha:8010"}/:path*`,
      },
      {
        source: "/api/mausam-chakra/:path*",
        destination: `${process.env.NEXT_PUBLIC_MAUSAM_CHAKRA_URL || "http://mausam-chakra:8011"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
