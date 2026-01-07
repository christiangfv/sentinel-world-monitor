import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { Provider } from "@/components/ui/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sentinel - Monitoreo de Desastres Naturales",
  description: "Aplicación PWA para monitorear desastres naturales en tiempo real. Recibe alertas de sismos, tsunamis, incendios y más en tu zona.",
  keywords: ["desastres naturales", "sismos", "alertas", "monitoreo", "PWA", "mapas"],
  authors: [{ name: "Christian González" }],
  creator: "Christian González",
  publisher: "Sentinel App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Sentinel - Monitoreo de Desastres Naturales",
    description: "Monitorea desastres naturales en tiempo real y recibe alertas personalizadas.",
    type: "website",
    locale: "es_ES",
    siteName: "Sentinel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel - Monitoreo de Desastres Naturales",
    description: "Monitorea desastres naturales en tiempo real y recibe alertas personalizadas.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Sentinel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sentinel" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="color-scheme" content="light dark" />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple */}
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.svg" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.svg" />

        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker registrado:', registration);
                    })
                    .catch(function(error) {
                      console.log('❌ Error registrando Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Provider>
          <AuthProvider>
            {children}
            <PWAInstallPrompt />
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
