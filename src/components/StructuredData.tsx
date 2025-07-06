// Schema.org structured data without complex typing to avoid conflicts

interface StructuredDataProps {
  type: 'website' | 'webapp' | 'howto' | 'faq';
  data?: {
    title?: string;
    description?: string;
    steps?: Array<{
      '@type': string;
      name: string;
      text: string;
      image?: string;
    }>;
    questions?: Array<{
      '@type': string;
      name: string;
      acceptedAnswer: {
        '@type': string;
        text: string;
      };
    }>;
  };
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = 'https://quickutil.app';
    
    switch (type) {
      case 'website':
        const websiteSchema = {
          '@type': 'WebSite',
          '@context': 'https://schema.org',
          name: 'QuickUtil',
          description: 'PDF sıkıştırma, format dönüştürme, fotoğraf sıkıştırma ve arka plan kaldırma araçları',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'QuickUtil',
            url: baseUrl
          },
          sameAs: [
            baseUrl
          ]
        };
        return websiteSchema;

      case 'webapp':
        const webAppSchema = {
          '@type': 'WebApplication',
          '@context': 'https://schema.org',
          name: 'QuickUtil - PDF ve Dosya İşleme Araçları',
          description: 'PDF sıkıştırma, format dönüştürme, fotoğraf sıkıştırma ve arka plan kaldırma araçları. Hızlı, güvenli ve ücretsiz online araçlar.',
          url: baseUrl,
          applicationCategory: 'Utilities',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          featureList: [
            'PDF Sıkıştırma',
            'PDF Format Dönüştürme', 
            'Resim Format Dönüştürme',
            'Fotoğraf Sıkıştırma',
            'Arka Plan Kaldırma'
          ],
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          softwareVersion: '1.0',
          author: {
            '@type': 'Organization',
            name: 'QuickUtil'
          }
        };
        return webAppSchema;

      case 'howto':
        const howToSchema = {
          '@type': 'HowTo',
          '@context': 'https://schema.org',
          name: data?.title || 'PDF Dosyası Nasıl Sıkıştırılır',
          description: data?.description || 'PDF dosyalarınızı kaliteden ödün vermeden nasıl sıkıştıracağınızı öğrenin',
          image: `${baseUrl}/images/pdf-compress-guide.jpg`,
          totalTime: 'PT2M',
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: '0'
          },
          tool: [{
            '@type': 'HowToTool',
            name: 'QuickUtil PDF Sıkıştırma Aracı'
          }],
          step: data?.steps || [
            {
              '@type': 'HowToStep',
              name: 'PDF Dosyasını Seçin',
              text: 'Sıkıştırmak istediğiniz PDF dosyasını seçin veya sürükleyip bırakın.',
              image: `${baseUrl}/images/step1.jpg`
            },
            {
              '@type': 'HowToStep', 
              name: 'Sıkıştırma Seviyesini Ayarlayın',
              text: 'İhtiyacınıza göre sıkıştırma seviyesini seçin.',
              image: `${baseUrl}/images/step2.jpg`
            },
            {
              '@type': 'HowToStep',
              name: 'Sıkıştır ve İndir',
              text: 'Sıkıştır butonuna tıklayın ve işlem tamamlandığında dosyanızı indirin.',
              image: `${baseUrl}/images/step3.jpg`
            }
          ]
        };
        return howToSchema;

      case 'faq':
        const faqSchema = {
          '@type': 'FAQPage',
          '@context': 'https://schema.org',
          mainEntity: data?.questions || [
            {
              '@type': 'Question',
              name: 'PDF sıkıştırma güvenli mi?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Evet, tüm işlemler tarayıcınızda gerçekleşir. Dosyalarınız sunucumuza yüklenmez ve işlem sonrası otomatik olarak silinir.'
              }
            },
            {
              '@type': 'Question',
              name: 'Hangi dosya formatları desteklenir?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'PDF sıkıştırma için PDF formatı, resim dönüştürme için PNG, JPEG, WebP formatları desteklenir.'
              }
            },
            {
              '@type': 'Question',
              name: 'Dosya boyutu limiti var mı?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'PDF dosyaları için maksimum 50MB, resim dosyaları için maksimum 10MB limit bulunmaktadır.'
              }
            }
          ]
        };
        return faqSchema;

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 