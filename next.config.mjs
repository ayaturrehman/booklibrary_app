/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  // Trace all dependencies for serverless functions
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/**/*', './node_modules/@prisma/client/**/*'],
  },
};

export default nextConfig;
