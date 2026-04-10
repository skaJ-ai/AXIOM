import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: ['bcryptjs', 'pg', 'pg-connection-string', 'pgpass', 'split2'],
};

export default nextConfig;
