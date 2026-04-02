/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sql.js"]
  },
  images: {
    remotePatterns: []
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
