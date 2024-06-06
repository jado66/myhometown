/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
      return [
        // Rewrites for 'mht' site
        {
          source: '/mht/:path*',
          destination: '/:path*',  // This will remove '/mht' from the URL
        },
        // Rewrites for 'cs' site
        {
          source: '/cs/:path*',
          destination: '/:path*',  // This will remove '/cs' from the URL
        }
      ]
    },
  };
  
export default nextConfig;

