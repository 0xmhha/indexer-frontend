/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@apollo/client',
      'date-fns',
    ],
  },
  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      // Remove console logs in production
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
}

module.exports = nextConfig
