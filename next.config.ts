import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude genkit and its dependencies from the client-side bundle
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'genkit',
        'firebase-admin',
        'long',
        '@grpc/grpc-js',
        'google-gax',
        'gaxios',
        'google-auth-library',
        'node-fetch',
        'fs',
        'util',
        'child_process',
        'os',
        'https',
        'http'
      ];
    }
    return config;
  },
};

export default nextConfig;
