/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        "fs": false,
        "path": false,
        "os": false,
      }
    }
    return config
  },

  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
