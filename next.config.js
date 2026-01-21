/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel deployment optimizations
  poweredByHeader: false,
  compress: true,
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Disable ESLint during build to avoid blocking deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript build errors (optional - comment out if you want strict checks)
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

