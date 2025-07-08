import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ADSENSE_CONFIG } from "@/lib/adsenseUtils";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

// Next.js 15 viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6'
};

// Basic metadata - locale-specific metadata will be in [locale]/layout.tsx
export const metadata: Metadata = {
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
    <html className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Google Consent Mode & AdSense */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Consent Mode v2
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500,
              });
              
              gtag('set', 'ads_data_redaction', true);
              gtag('set', 'url_passthrough', false);
            `,
          }}
        />
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
      <body>
{/* LocaleDetector removed - now using URL-based routing */}
        <ClientLayout>{children}</ClientLayout>
        
        {/* Google AdSense - Manual Loading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var script = document.createElement('script');
                  script.src = '${ADSENSE_CONFIG.scriptSrc}';
                  script.async = true;
                  script.crossOrigin = '${ADSENSE_CONFIG.crossOrigin}';
                  script.onload = function() {
                    console.log('AdSense script loaded successfully');
                  };
                  script.onerror = function() {
                    console.log('AdSense script failed to load');
                  };
                  document.head.appendChild(script);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
