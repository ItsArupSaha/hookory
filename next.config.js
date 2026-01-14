/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization for app directory to avoid React hooks issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
