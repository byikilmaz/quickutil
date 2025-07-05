import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickUtil - PDF Sıkıştırma ve Dosya Dönüştürme",
  description: "PDF sıkıştırma, format dönüştürme, fotoğraf sıkıştırma ve arka plan kaldırma araçları",
  keywords: "PDF sıkıştırma, PDF dönüştürme, fotoğraf sıkıştırma, PNG JPEG, arka plan kaldırma",
  authors: [{ name: "QuickUtil" }],
  openGraph: {
    title: "QuickUtil - PDF ve Dosya İşleme Araçları",
    description: "Ücretsiz PDF sıkıştırma, format dönüştürme ve fotoğraf işleme araçları",
    url: "https://quickutil.app",
    siteName: "QuickUtil",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickUtil - PDF ve Dosya İşleme Araçları",
    description: "Ücretsiz PDF sıkıştırma, format dönüştürme ve fotoğraf işleme araçları",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
