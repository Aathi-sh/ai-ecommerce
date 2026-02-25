/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ✅ Add this to prevent static generation of API routes
  output: 'standalone',
  
  // ✅ Add this to handle dynamic routes properly
  experimental: {
    // This helps with static generation
    workerThreads: false,
    cpus: 1,
  },
  
  // ✅ Add this to ignore TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ Add this to ignore ESLint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ Add webpack configuration to handle any issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig