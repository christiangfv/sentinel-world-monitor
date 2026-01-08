/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Deshabilitar Turbopack para compatibilidad
  experimental: {
    turbo: false
  }
}

module.exports = nextConfig
