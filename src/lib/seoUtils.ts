import { Metadata } from 'next';

interface PageSEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

export const generatePageMetadata = (pageData: PageSEOData): Metadata => {
  const baseUrl = 'https://quickutil.app';
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageData.canonicalUrl,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: pageData.canonicalUrl,
      siteName: 'QuickUtil',
      type: 'website',
      locale: 'tr_TR',
      images: pageData.ogImage ? [
        {
          url: pageData.ogImage,
          width: 1200,
          height: 630,
          alt: pageData.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.title,
      description: pageData.description,
      images: pageData.ogImage ? [pageData.ogImage] : undefined,
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
  };
};

export const getPageSEOData = (page: string): PageSEOData => {
  const baseUrl = 'https://quickutil.app';
  
  const seoData: Record<string, PageSEOData> = {
    home: {
      title: 'QuickUtil - Ücretsiz PDF Sıkıştırma ve Dosya Dönüştürme Araçları',
      description: 'PDF sıkıştırma, format dönüştürme, fotoğraf sıkıştırma ve arka plan kaldırma araçları. Hızlı, güvenli ve ücretsiz online araçlar.',
      keywords: 'PDF sıkıştırma, PDF dönüştürme, fotoğraf sıkıştırma, PNG JPEG, arka plan kaldırma, ücretsiz online araçlar',
      canonicalUrl: baseUrl,
      ogImage: `${baseUrl}/images/og-home.jpg`,
    },
    'pdf-compress': {
      title: 'PDF Sıkıştırma - Ücretsiz Online PDF Küçültme Aracı | QuickUtil',
      description: 'PDF dosyalarınızı kaliteden ödün vermeden sıkıştırın. Ücretsiz, hızlı ve güvenli PDF küçültme aracı. Maksimum 50MB desteklenir.',
      keywords: 'PDF sıkıştırma, PDF küçültme, PDF compress, PDF boyut küçültme, ücretsiz PDF sıkıştırma aracı',
      canonicalUrl: `${baseUrl}/pdf-compress`,
      ogImage: `${baseUrl}/images/og-pdf-compress.jpg`,
    },
    'pdf-convert': {
      title: 'PDF Dönüştürme - PDF Sayfa Ayırma, Birleştirme ve Resim Çıkarma | QuickUtil',
      description: 'PDF dosyalarını farklı formatlara dönüştürün, sayfalara ayırın, birleştirin veya resim formatına çevirin. Ücretsiz PDF dönüştürme araçları.',
      keywords: 'PDF dönüştürme, PDF sayfa ayırma, PDF birleştirme, PDF to JPG, PDF to PNG, PDF split, PDF merge',
      canonicalUrl: `${baseUrl}/pdf-convert`,
      ogImage: `${baseUrl}/images/og-pdf-convert.jpg`,
    },
    'image-convert': {
      title: 'Resim Format Dönüştürme - PNG, JPEG, WebP Çevirici | QuickUtil',
      description: 'Resim formatları arasında dönüştürme yapın. PNG, JPEG, WebP formatları desteklenir. Kalite ayarı ve boyut optimizasyonu mevcut.',
      keywords: 'resim dönüştürme, PNG to JPEG, JPEG to PNG, WebP converter, resim format değiştirme',
      canonicalUrl: `${baseUrl}/image-convert`,
      ogImage: `${baseUrl}/images/og-image-convert.jpg`,
    },
  };

  return seoData[page] || seoData.home;
};

// H1-H6 header hierarchy için utility
export const createHeaderHierarchy = (content: {
  h1: string;
  h2?: string[];
  h3?: string[];
}) => {
  return {
    h1: content.h1,
    h2: content.h2 || [],
    h3: content.h3 || [],
  };
};

// Breadcrumb data oluşturma
export const generateBreadcrumbData = (path: string) => {
  const baseUrl = 'https://quickutil.app';
  const pathSegments = path.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: baseUrl,
    }
  ];

  const routes: Record<string, string> = {
    'pdf-compress': 'PDF Sıkıştırma',
    'pdf-convert': 'PDF Dönüştürme', 
    'image-convert': 'Resim Dönüştürme',
  };

  pathSegments.forEach((segment, index) => {
    if (routes[segment]) {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: index + 2,
        name: routes[segment],
        item: `${baseUrl}/${pathSegments.slice(0, index + 1).join('/')}`,
      });
    }
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  };
};

// Alt text generator for images
export const generateImageAlt = (context: string, description?: string) => {
  const contexts: Record<string, string> = {
    'pdf-compress': 'PDF sıkıştırma aracı',
    'pdf-convert': 'PDF dönüştürme aracı',
    'image-convert': 'Resim dönüştürme aracı',
    'logo': 'QuickUtil logo',
    'icon': 'Araç ikonu',
  };

  const baseAlt = contexts[context] || context;
  return description ? `${baseAlt} - ${description}` : baseAlt;
}; 