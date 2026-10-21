/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone' disabled for Vercel (uncomment for Docker self-hosting)
  // Use Vercel's default output; standalone breaks Vercel's nft.json trace
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  async redirects() {
    return [
      { source: '/pricing', destination: '/contact', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

module.exports = nextConfig;
