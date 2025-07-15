import { Metadata } from 'next';
import { generateLocaleMetadata } from '@/lib/seoUtils';
import dynamic from 'next/dynamic';

// Dynamic import for client component
const PDFConvertClient = dynamic(() => import('./PDFConvertClient'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

// Enhanced metadata for PDF convert page with E-E-A-T signals
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateLocaleMetadata(locale, 'pdf-convert');
}

// Server wrapper component to handle async params  
export default async function PDFConvertPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFConvertClient locale={locale} />;
} 