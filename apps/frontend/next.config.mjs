/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/generate-document',
        destination: '/api/generate-document',
      },

      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
        has: [
          {
            type: 'header',
            key: 'x-bypass-serverless',
            value: 'true',
          },
        ],
      },

      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
