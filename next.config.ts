import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't pick up the stray
  // ~/package-lock.json (left behind by global `shadcn` install).
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ['localhost', '*.local'],
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
