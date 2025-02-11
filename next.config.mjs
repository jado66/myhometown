/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              script-src 'self' 'unsafe-eval' 'unsafe-inline' * *.google.com *.googleapis.com *.gstatic.com;
              connect-src 'self' *;
              frame-src 'self' * *.google.com *.googleapis.com;
              img-src 'self' 'unsafe-inline' data: * *.amazonaws.com;
              style-src 'self' 'unsafe-inline' *;
              font-src 'self' data: *;
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
