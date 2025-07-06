import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
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
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
