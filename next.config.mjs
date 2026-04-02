/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sql.js"],
  images: {
    remotePatterns: []
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
