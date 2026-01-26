import type {NextConfig} from 'next';

/**
 * Backend API URL (server-side only, not exposed to client)
 * - Development: defaults to 'http://localhost:4000'
 * - Production: set API_URL to your backend server (e.g., https://api.hireme.dev)
 */
const API_URL = process.env.API_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
