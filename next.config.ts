import type { NextConfig } from "next";

/**
 * 🔥 Oracle Cloud PDF Compression Integration
 * 
 * Environment Variables needed:
 * 
 * NEXT_PUBLIC_ORACLE_COMPRESSION_API=https://your-oracle-domain.com
 * 
 * Example values:
 * - Development: https://pdf-compressor.dev.oracle.cloud
 * - Production: https://compression-api.quickutil.app
 * - Local Testing: http://localhost:5000
 * 
 * Setup Guide:
 * 1. Create Oracle Cloud Always Free account
 * 2. Deploy Python compression service (see oracle-cloud-setup.md)
 * 3. Get public IP or domain name
 * 4. Add NEXT_PUBLIC_ORACLE_COMPRESSION_API to .env.local
 * 5. Test health endpoint: https://your-domain.com/health
 * 
 * Benefits:
 * - 100% FREE unlimited compression
 * - iLovePDF-level compression (80-90%)
 * - Professional Ghostscript backend
 * - Always Free tier - no time limits
 */
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
    // Cache buster for HEIC update
    return `heic-support-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
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
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
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
  env: {
    // Render.com PDF Compression API - LIVE URL
    NEXT_PUBLIC_RENDER_API_URL: process.env.NEXT_PUBLIC_RENDER_API_URL || 'https://quickutil-pdf-api.onrender.com',
  },
};

export default nextConfig;
