'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { Toaster } from "react-hot-toast";
import StructuredData from "@/components/StructuredData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

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
    <AuthProvider>
      <QuotaProvider>
        <StructuredData type="website" />
        <StructuredData type="webapp" />
        
        <div className="min-h-screen flex flex-col">
          {!isAdminPage && <Header onAuthClick={() => setShowAuthModal(true)} />}
          <main className="flex-grow">
            {children}
          </main>
          {!isAdminPage && <Footer />}
        </div>
        
        {/* Global Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
          />
        )}
        
        <Toaster position="top-right" />
      </QuotaProvider>
    </AuthProvider>
  );
} 