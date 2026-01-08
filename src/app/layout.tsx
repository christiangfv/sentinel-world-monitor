import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { Provider } from '@/components/ui/provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Sentinel – World Monitor',
  description: 'Monitoreo de eventos naturales en tiempo real',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sentinel',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0E14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-[#0D0E14] text-[#E8E8F0] antialiased">
        <Provider>
          <AuthProvider>
            {children}
            <PWAInstallPrompt />
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
