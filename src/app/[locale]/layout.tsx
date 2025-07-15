import type { Metadata } from "next";
import { generateLocaleMetadata, generateLocalizedOGData } from '@/lib/seoUtils';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/StructuredData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Generate static params for supported locales
export function generateStaticParams() {
  return [
    { locale: 'tr' }, { locale: 'en' }, { locale: 'es' },
    { locale: 'fr' }, { locale: 'de' }, { locale: 'ar' },
    { locale: 'ja' }, { locale: 'ko' }
  ];
}

// Generate metadata for each locale
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseMetadata = generateLocaleMetadata(locale, 'home');
  const ogData = generateLocalizedOGData(locale, 'home');
  
  return {
    ...baseMetadata,
    openGraph: ogData,
    twitter: {
      card: 'summary_large_image',
      site: '@quickutil',
      creator: '@quickutil',
      title: ogData.title,
      description: ogData.description,
      images: ogData.images
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate locale (AR, JA, KO kaldırıldı)
  const validLocales = ['tr', 'en', 'es', 'fr', 'de'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  return (
    <>
      <StructuredData page="home" type="website" locale={locale} />
      {children}
    </>
  );
} 