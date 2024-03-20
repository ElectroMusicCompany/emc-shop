/** @type {import('next').NextConfig} */
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
  }
};

export default nextConfig;
