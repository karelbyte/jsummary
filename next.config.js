/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar-management--avatars.us-west-2.prod.public.atl-paas.net',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig; 