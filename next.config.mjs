/** @type {import('next').NextConfig} */
import pkg from './package.json' assert { type: "json" };
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "cdn.discordapp.com",
        port: '',
        pathname: "/**"
      },
      {
        protocol: 'https',
        hostname: "*.r2.dev",
        port: '',
        pathname: "/**"
      }
    ]
  },
  publicRuntimeConfig: {
    version: pkg.version,
  },
};

export default nextConfig;
