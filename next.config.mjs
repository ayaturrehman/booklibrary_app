/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Explicitly include Prisma engine files in all API routes
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
      './node_modules/@prisma/engines/**/*',
    ],
  },
};

export default nextConfig;
