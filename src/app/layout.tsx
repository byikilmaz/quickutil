import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleDriveProvider } from "@/contexts/GoogleDriveContext";
import StructuredData from "@/components/StructuredData";
import { getPageSEOData, generatePageMetadata } from "@/lib/seoUtils";

const inter = Inter({ subsets: ["latin"] });

// Dynamic metadata based on page
export const metadata: Metadata = generatePageMetadata(getPageSEOData('home'));

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
          <GoogleDriveProvider>
            {children}
          </GoogleDriveProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
