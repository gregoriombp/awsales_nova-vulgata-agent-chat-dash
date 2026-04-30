import type { NextConfig } from "next";

const lanOrigins = process.env.DEV_LAN
  ? ['*'] // qualquer origem da rede — só em dev, controlado por DEV_LAN=1
  : ['10.10.255.130', '*.local'];

const nextConfig: NextConfig = {
  allowedDevOrigins: lanOrigins,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  async rewrites() {
    return [
      { source: '/design', destination: '/design.html' },
    ];
  },
  async redirects() {
    return [
      { source: '/styleguide', destination: '/bombardier/styleguide', permanent: false },
      { source: '/styleguide/:path*', destination: '/bombardier/styleguide/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
