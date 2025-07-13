import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  HeartIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    tr: 'Hakkımızda | QuickUtil.app - Ücretsiz PDF ve Dosya İşleme Araçları',
    en: 'About Us | QuickUtil.app - Free PDF and File Processing Tools',
    es: 'Acerca de | QuickUtil.app - Herramientas Gratuitas de PDF y Archivos',
    fr: 'À Propos | QuickUtil.app - Outils PDF et Fichiers Gratuits',
    de: 'Über Uns | QuickUtil.app - Kostenlose PDF- und Datei-Tools',
    ar: 'من نحن | QuickUtil.app - أدوات PDF ومعالجة الملفات المجانية',
    ja: '会社概要 | QuickUtil.app - 無料PDFとファイル処理ツール',
    ko: '회사소개 | QuickUtil.app - 무료 PDF 및 파일 처리 도구'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: 'QuickUtil.app team information, mission, vision and values.',
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'en'; // Default to English for this page
  const t = getTranslations(finalLocale);

  // Helper function for translations
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <HeartIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                💙 {getText('about.title', 'Hakkımızda')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {getText('about.subtitle', 'QuickUtil.app olarak dijital dosya işleme alanında yenilikçi çözümler sunuyoruz')}
              </p>
            </div>
          </div>
        </div>

        {/* Content sections with dynamic content based on locale */}
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{getText('about.mission', 'Misyonumuz')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {getText('about.missionContent', 'Dijital dünyada dosya işleme süreçlerini herkes için erişilebilir, hızlı ve güvenli hale getirmek. QuickUtil.app olarak, karmaşık teknik süreçleri basit ve kullanıcı dostu araçlara dönüştürüyoruz.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{getText('about.vision', 'Vizyonumuz')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {getText('about.visionContent', 'Dünya genelinde dosya işleme alanında lider platform olmak ve milyonlarca kullanıcının dijital hayatını kolaylaştırmak. Sürekli yenilik ve kullanıcı deneyimi odaklı gelişim ile sektörde standartları belirlemek.')}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 {getText('about.statistics', 'İstatistiklerimiz')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '1M+', label: getText('about.stats.users', 'Kullanıcı') },
                { value: '50M+', label: getText('about.stats.filesProcessed', 'İşlenen Dosya') },
                { value: '99.9%', label: getText('about.stats.uptime', 'Uptime') },
                { value: '24/7', label: getText('about.stats.support', 'Destek') }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎯 {getText('about.values', 'Değerlerimiz')}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <HeartIcon className="h-8 w-8" />,
                  title: getText('about.values.userFocused.title', 'Kullanıcı Odaklı'),
                  desc: getText('about.values.userFocused.desc', 'Her zaman kullanıcı deneyimini ön planda tutuyoruz')
                },
                {
                  icon: <ShieldCheckIcon className="h-8 w-8" />,
                  title: getText('about.values.security.title', 'Güvenlik'),
                  desc: getText('about.values.security.desc', 'Verilerinizin güvenliği en yüksek önceliğimiz')
                },
                {
                  icon: <BoltIcon className="h-8 w-8" />,
                  title: getText('about.values.fast.title', 'Hızlı'),
                  desc: getText('about.values.fast.desc', 'Maksimum performans ve hız sunuyoruz')
                },
                {
                  icon: <CheckCircleIcon className="h-8 w-8" />,
                  title: getText('about.values.quality.title', 'Kalite'),
                  desc: getText('about.values.quality.desc', 'Yüksek kaliteli çıktılar garanti ediyoruz')
                }
              ].map((value, index) => (
                <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-blue-600 mb-3 flex justify-center">{value.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 