/** @type {import('next').NextConfig} */
const nextConfig = {
  // Revertido a static export para Firebase Hosting
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    // Exponer variables de entorno de manera segura para el cliente
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  }
}

module.exports = nextConfig
