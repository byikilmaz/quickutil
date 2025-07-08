'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { StorageProvider } from "@/contexts/StorageContext";
import { Toaster } from "react-hot-toast";
import StructuredData from "@/components/StructuredData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  
  // Admin sayfalarında Header ve Footer gizle
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QuotaProvider>
          <StorageProvider>
            <div className="min-h-screen flex flex-col">
              <StructuredData />
              
              {!isAdminPage && (
                <ErrorBoundary>
                  <Header onAuthClick={() => setShowAuthModal(true)} />
                </ErrorBoundary>
              )}
              
              <main className="flex-grow">
                {children}
              </main>
              
              {!isAdminPage && (
                <ErrorBoundary>
                  <Footer />
                </ErrorBoundary>
              )}
            </div>
            
            {showAuthModal && (
              <ErrorBoundary>
                <AuthModal onClose={() => setShowAuthModal(false)} />
              </ErrorBoundary>
            )}
            
            <ErrorBoundary>
              <CookieConsentBanner />
            </ErrorBoundary>
            
            <Toaster position="top-right" />
          </StorageProvider>
        </QuotaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
} 