import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Static export for Firebase hosting
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [], // Completely ignore ESLint
  },
  
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Cache busting and optimization
  generateBuildId: async () => {
    // Generate unique build ID based on timestamp
    return `build-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  },
  
  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Image optimization (disable for static export)
  images: {
    unoptimized: true,
  },
  
  // Compile options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack config for better chunking
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    // Force cache busting for assets
    config.output.filename = 'static/chunks/[name]-[contenthash].js';
    config.output.chunkFilename = 'static/chunks/[name]-[contenthash].js';
    return config;
  },
  
  // Fix CSS preload issues
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};

export default nextConfig;
