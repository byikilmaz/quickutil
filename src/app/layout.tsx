import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { Toaster } from "react-hot-toast";
import StructuredData from "@/components/StructuredData";
import Footer from "@/components/Footer";
import { getPageSEOData, generatePageMetadata } from "@/lib/seoUtils";

const inter = Inter({ subsets: ["latin"] });

// Next.js 15 viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6'
};

// Dynamic metadata based on page
export const metadata: Metadata = {
  ...generatePageMetadata(getPageSEOData('home')),
  title: 'QuickUtil.app - Ücretsiz PDF ve Resim Araçları',
  description: 'PDF sıkıştırma, resim düzenleme ve format dönüştürme araçları. Tamamen ücretsiz, güvenli ve hızlı.',
  keywords: 'PDF sıkıştırma, resim düzenleme, format dönüştürme, ücretsiz araçlar',
  authors: [{ name: 'QuickUtil Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'QuickUtil.app - Ücretsiz PDF ve Resim Araçları',
    description: 'PDF ve resim işleme araçlarının tamamı ücretsiz! Hemen başlayın.',
    url: 'https://quickutil.app',
    siteName: 'QuickUtil.app',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'QuickUtil.app - Ücretsiz PDF ve Resim Araçları',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickUtil.app - Ücretsiz PDF ve Resim Araçları',
    description: 'PDF sıkıştırma, resim düzenleme ve format dönüştürme araçları. Tamamen ücretsiz!',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://quickutil.app',
    languages: {
      'tr-TR': 'https://quickutil.app',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <StructuredData type="website" />
        <StructuredData type="webapp" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New content is available; show update notification
                              if (confirm('Yeni güncelleme mevcut! Sayfayı yeniden yüklemek istiyor musunuz?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                              }
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (event.data && event.data.type === 'CACHE_CLEARED') {
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <QuotaProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" />
          </QuotaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
