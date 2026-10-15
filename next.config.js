/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration for deployment
  eslint: {
    // Require lint validation before a production build
    ignoreDuringBuilds: false,
  },
  // TypeScript configuration
  typescript: {
    // Require TypeScript validation before a production build
    ignoreBuildErrors: false,
  },
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure proper routing for Vercel
  trailingSlash: false,
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
  // Optimize for Vercel deployment
  compress: true,
  // Build optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig