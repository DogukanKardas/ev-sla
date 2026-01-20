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
  // Environment variables that should be available in the browser
  // Note: NEXT_PUBLIC_APP_URL should be set in Vercel dashboard
  // Vercel automatically provides VERCEL_URL environment variable
}

module.exports = nextConfig

