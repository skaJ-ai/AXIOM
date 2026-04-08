import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: ['bcryptjs', 'pg'],
};

export default nextConfig;
