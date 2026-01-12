/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export para Firebase Hosting
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
