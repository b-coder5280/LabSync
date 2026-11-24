import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Bundle the Admin SDK's CommonJS-to-ESM dependency chain for serverless Node.
  transpilePackages: ['firebase-admin', 'jwks-rsa', 'jose'],
};

export default nextConfig;
