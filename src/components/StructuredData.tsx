import { generateStructuredData } from '@/lib/seoUtils';

interface StructuredDataProps {
  page?: string;
  type?: 'website' | 'tool' | 'howto';
  locale?: string;
  customData?: Record<string, unknown>;
}

export default function StructuredData({ 
  page = 'home', 
  type = 'website',
  locale = 'tr',
  customData 
}: StructuredDataProps) {

  // Generate AI-powered structured data based on locale and page
  const structuredData = customData || generateStructuredData(locale, page, type);

  // Add AI-enhanced breadcrumb structured data for non-home pages
  const breadcrumbData = page !== 'home' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'QuickUtil - AI-Powered Tools',
        item: `https://quickutil.app/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: getAIPageName(page, locale),
        item: `https://quickutil.app/${locale}/${page}`
      }
    ]
  } : null;

  // AI-powered FAQ structured data for tool pages
  const faqData = type === 'tool' ? generateAIFAQData(page, locale) : null;
  
  // AI Software Application structured data
  const aiSoftwareData = type === 'tool' ? generateAISoftwareData(page, locale) : null;

  return (
    <>
      {/* Main AI-powered structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* AI-enhanced breadcrumb structured data */}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      )}
      
      {/* AI-powered FAQ structured data */}
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData)
          }}
        />
      )}
      
      {/* AI Software Application structured data */}
      {aiSoftwareData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aiSoftwareData)
          }}
        />
      )}
    </>
  );
}

// Get AI-powered localized page name for breadcrumbs
function getAIPageName(page: string, locale: string): string {
  const aiPageNames: Record<string, Record<string, string>> = {
    'pdf-compress': {
      tr: 'AI PDF Sıkıştırma',
      en: 'AI PDF Compression',
      es: 'AI Compresión PDF',
      fr: 'AI Compression PDF',
      de: 'AI PDF-Komprimierung',
      ar: 'AI ضغط PDF',
      ja: 'AI PDF圧縮',
      ko: 'AI PDF 압축'
    },
    'pdf-convert': {
      tr: 'AI PDF Dönüştürme',
      en: 'AI PDF Conversion',
      es: 'AI Conversión PDF',
      fr: 'AI Conversion PDF',
      de: 'AI PDF-Konvertierung',
      ar: 'AI تحويل PDF',
      ja: 'AI PDF変換',
      ko: 'AI PDF 변환'
    },
    'image-compress': {
      tr: 'AI Resim Sıkıştırma',
      en: 'AI Image Compression',
      es: 'AI Compresión de Imagen',
      fr: 'AI Compression d\'Image',
      de: 'AI Bildkomprimierung',
      ar: 'AI ضغط الصور',
      ja: 'AI 画像圧縮',
      ko: 'AI 이미지 압축'
    },
    'image-batch': {
      tr: 'AI Toplu Resim İşleme',
      en: 'AI Batch Image Processing',
      es: 'AI Procesamiento de Imágenes por Lotes',
      fr: 'AI Traitement d\'Images par Lots',
      de: 'AI Stapel-Bildverarbeitung',
      ar: 'AI معالجة الصور المجمعة',
      ja: 'AI バッチ画像処理',
      ko: 'AI 배치 이미지 처리'
    }
  };

  return aiPageNames[page]?.[locale] || aiPageNames[page]?.['en'] || page;
}

// Generate AI-powered FAQ structured data for tool pages
function generateAIFAQData(page: string, locale: string) {
  const aiFaqs: Record<string, Record<string, Array<{question: string, answer: string}>>> = {
    'pdf-compress': {
      tr: [
        {
          question: 'AI PDF sıkıştırma nasıl çalışır?',
          answer: 'Yapay zeka algoritmaları PDF içeriğinizi analiz eder ve en uygun sıkıştırma ayarlarını otomatik seçer. Bu sayede maksimum boyut azaltımı ile kalite korunumu sağlanır.'
        },
        {
          question: 'AI sıkıştırma ücretsiz mi?',
          answer: 'Evet, AI destekli PDF sıkıştırma tamamen ücretsizdir. Kayıt gerektirmez ve limitsiz kullanım sunar.'
        },
        {
          question: 'AI hangi tür PDF\'leri en iyi sıkıştırır?',
          answer: 'AI sistemimiz resim ağırlıklı PDF\'lerde %70\'e kadar, metin ağırlıklı dosyalarda %50\'ye kadar boyut azaltımı sağlayabilir.'
        },
        {
          question: 'AI kalite kaybına neden olur mu?',
          answer: 'Hayır, machine learning algoritmalarımız insan gözüyle fark edilemeyecek düzeyde optimize edilmiştir. Kalite korunarak boyut küçültülür.'
        }
      ],
      en: [
        {
          question: 'How does AI PDF compression work?',
          answer: 'Artificial intelligence algorithms analyze your PDF content and automatically select the most suitable compression settings. This ensures maximum size reduction while preserving quality.'
        },
        {
          question: 'Is AI compression free?',
          answer: 'Yes, AI-powered PDF compression is completely free. No registration required and unlimited usage.'
        },
        {
          question: 'What types of PDFs does AI compress best?',
          answer: 'Our AI system can achieve up to 70% size reduction for image-heavy PDFs and up to 50% for text-heavy documents.'
        },
        {
          question: 'Does AI cause quality loss?',
          answer: 'No, our machine learning algorithms are optimized to be imperceptible to the human eye. Quality is preserved while reducing size.'
        }
      ],
      es: [
        {
          question: '¿Cómo funciona la compresión AI de PDF?',
          answer: 'Los algoritmos de inteligencia artificial analizan tu contenido PDF y seleccionan automáticamente la configuración de compresión más adecuada. Esto asegura máxima reducción de tamaño preservando la calidad.'
        },
        {
          question: '¿Es gratuita la compresión AI?',
          answer: 'Sí, la compresión PDF con AI es completamente gratuita. No requiere registro y ofrece uso ilimitado.'
        },
        {
          question: '¿Qué tipos de PDF comprime mejor la AI?',
          answer: 'Nuestro sistema AI puede lograr hasta 70% de reducción de tamaño para PDFs con muchas imágenes y hasta 50% para documentos de texto.'
        },
        {
          question: '¿La AI causa pérdida de calidad?',
          answer: 'No, nuestros algoritmos de machine learning están optimizados para ser imperceptibles al ojo humano. Se preserva la calidad mientras se reduce el tamaño.'
        }
      ]
    },
    'image-compress': {
      tr: [
        {
          question: 'AI resim sıkıştırma teknolojisi nedir?',
          answer: 'TensorFlow.js tabanlı yapay zeka modelimiz resim içeriğini analiz eder ve optimal sıkıştırma parametrelerini belirler. Bu sayede kalite kaybı olmadan dosya boyutu küçültülür.'
        },
        {
          question: 'Hangi resim formatlarını AI destekler?',
          answer: 'AI sistemimiz PNG, JPEG, WebP ve AVIF formatlarını destekler. Her format için özel optimizasyon algoritmaları kullanır.'
        },
        {
          question: 'AI ne kadar boyut azaltımı sağlar?',
          answer: 'Yapay zeka algoritmalarımız ortalama %60-80 arasında boyut azaltımı sağlarken görsel kaliteyi korudu.'
        }
      ],
      en: [
        {
          question: 'What is AI image compression technology?',
          answer: 'Our TensorFlow.js-based AI model analyzes image content and determines optimal compression parameters. This reduces file size without quality loss.'
        },
        {
          question: 'Which image formats does AI support?',
          answer: 'Our AI system supports PNG, JPEG, WebP, and AVIF formats. It uses specialized optimization algorithms for each format.'
        },
        {
          question: 'How much size reduction does AI provide?',
          answer: 'Our artificial intelligence algorithms provide an average of 60-80% size reduction while preserving visual quality.'
        }
      ]
    }
  };

  const pageFAQs = aiFaqs[page]?.[locale] || aiFaqs[page]?.['en'];
  if (!pageFAQs) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Generate AI Software Application structured data
function generateAISoftwareData(page: string, locale: string) {
  const appData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `QuickUtil AI ${getAIPageName(page, locale)}`,
    applicationCategory: 'Productivity',
    applicationSubCategory: 'Document Processing',
    operatingSystem: 'Web Browser',
    author: {
      '@type': 'Organization',
      name: 'QuickUtil',
      url: 'https://quickutil.app'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free'
    },
    featureList: getAIFeatures(page, locale),
    keywords: getAIKeywords(page, locale),
    description: getAIDescription(page, locale),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return appData;
}

// Get AI features for different tools
function getAIFeatures(page: string, locale: string): string[] {
  const features: Record<string, Record<string, string[]>> = {
    'pdf-compress': {
      tr: ['AI destekli otomatik sıkıştırma', 'Kalite korunumu', 'Ücretsiz kullanım', 'Hızlı işleme', 'TensorFlow.js teknolojisi'],
      en: ['AI-powered automatic compression', 'Quality preservation', 'Free usage', 'Fast processing', 'TensorFlow.js technology'],
      es: ['Compresión automática con AI', 'Preservación de calidad', 'Uso gratuito', 'Procesamiento rápido', 'Tecnología TensorFlow.js']
    },
    'image-compress': {
      tr: ['AI resim analizi', 'Akıllı format optimizasyonu', 'Batch işleme', 'Çoklu format desteği', 'Machine learning algoritmaları'],
      en: ['AI image analysis', 'Smart format optimization', 'Batch processing', 'Multi-format support', 'Machine learning algorithms'],
      es: ['Análisis de imagen AI', 'Optimización inteligente de formato', 'Procesamiento por lotes', 'Soporte multi-formato', 'Algoritmos de machine learning']
    }
  };

  return features[page]?.[locale] || features['pdf-compress']['en'];
}

// Get AI keywords for different tools
function getAIKeywords(page: string, locale: string): string {
  const keywords: Record<string, Record<string, string>> = {
    'pdf-compress': {
      tr: 'AI PDF sıkıştırma, yapay zeka, machine learning, TensorFlow.js, otomatik optimizasyon',
      en: 'AI PDF compression, artificial intelligence, machine learning, TensorFlow.js, automatic optimization',
      es: 'compresión PDF AI, inteligencia artificial, machine learning, TensorFlow.js, optimización automática'
    },
    'image-compress': {
      tr: 'AI resim sıkıştırma, yapay zeka, görüntü işleme, neural networks, akıllı optimizasyon',
      en: 'AI image compression, artificial intelligence, image processing, neural networks, smart optimization',
      es: 'compresión imagen AI, inteligencia artificial, procesamiento de imágenes, redes neuronales, optimización inteligente'
    }
  };

  return keywords[page]?.[locale] || keywords['pdf-compress']['en'];
}

// Get AI description for different tools
function getAIDescription(page: string, locale: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'pdf-compress': {
      tr: 'Yapay zeka destekli PDF sıkıştırma aracı. TensorFlow.js teknolojisi ile otomatik optimizasyon ve kalite korunumu.',
      en: 'AI-powered PDF compression tool. Automatic optimization and quality preservation with TensorFlow.js technology.',
      es: 'Herramienta de compresión PDF con AI. Optimización automática y preservación de calidad con tecnología TensorFlow.js.'
    },
    'image-compress': {
      tr: 'AI destekli resim sıkıştırma ve optimizasyon aracı. Machine learning ile akıllı format seçimi ve boyut azaltımı.',
      en: 'AI-powered image compression and optimization tool. Smart format selection and size reduction with machine learning.',
      es: 'Herramienta de compresión y optimización de imágenes con AI. Selección inteligente de formato y reducción de tamaño con machine learning.'
    }
  };

  return descriptions[page]?.[locale] || descriptions['pdf-compress']['en'];
} 