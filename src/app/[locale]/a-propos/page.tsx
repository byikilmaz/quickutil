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
                💙 {(t as any)['about.title']}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {(t as any)['about.subtitle']}
              </p>
            </div>
          </div>
        </div>

        {/* Content sections with dynamic content based on locale */}
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{(t as any)['about.mission']}</h3>
              <p className="text-gray-600 leading-relaxed">
                {finalLocale === 'tr' ? 
                  'Dijital dünyada dosya işleme süreçlerini herkes için erişilebilir, hızlı ve güvenli hale getirmek. QuickUtil.app olarak, karmaşık teknik süreçleri basit ve kullanıcı dostu araçlara dönüştürüyoruz.' :
                  finalLocale === 'fr' ?
                  'Rendre le traitement de fichiers accessible, rapide et sécurisé pour tous dans le monde numérique. Chez QuickUtil.app, nous transformons les processus techniques complexes en outils simples et conviviaux.' :
                  'Making file processing accessible, fast and secure for everyone in the digital world. As QuickUtil.app, we transform complex technical processes into simple and user-friendly tools.'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{(t as any)['about.vision']}</h3>
              <p className="text-gray-600 leading-relaxed">
                {finalLocale === 'tr' ? 
                  'Dünya genelinde dosya işleme alanında lider platform olmak ve milyonlarca kullanıcının dijital hayatını kolaylaştırmak. Sürekli yenilik ve kullanıcı deneyimi odaklı gelişim ile sektörde standartları belirlemek.' :
                  finalLocale === 'fr' ?
                  'Devenir la plateforme leader dans le traitement de fichiers à l\'échelle mondiale et simplifier la vie numérique de millions d\'utilisateurs. Établir les standards de l\'industrie grâce à l\'innovation continue et au développement axé sur l\'expérience utilisateur.' :
                  'To become the leading platform in file processing worldwide and simplify the digital lives of millions of users. Setting industry standards through continuous innovation and user experience-focused development.'
                }
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 {(t as any)['about.statistics']}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '1M+', label: finalLocale === 'tr' ? 'Kullanıcı' : finalLocale === 'fr' ? 'Utilisateurs' : 'Users' },
                { value: '50M+', label: finalLocale === 'tr' ? 'İşlenen Dosya' : finalLocale === 'fr' ? 'Fichiers Traités' : 'Files Processed' },
                { value: '99.9%', label: finalLocale === 'tr' ? 'Uptime' : finalLocale === 'fr' ? 'Disponibilité' : 'Uptime' },
                { value: '24/7', label: finalLocale === 'tr' ? 'Destek' : finalLocale === 'fr' ? 'Support' : 'Support' }
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎯 {(t as any)['about.values']}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <HeartIcon className="h-8 w-8" />,
                  title: finalLocale === 'tr' ? 'Kullanıcı Odaklı' : finalLocale === 'fr' ? 'Centré sur l\'Utilisateur' : 'User Focused',
                  desc: finalLocale === 'tr' ? 'Her zaman kullanıcı deneyimini ön planda tutuyoruz' : finalLocale === 'fr' ? 'Nous priorisons toujours l\'expérience utilisateur' : 'We always prioritize user experience'
                },
                {
                  icon: <ShieldCheckIcon className="h-8 w-8" />,
                  title: finalLocale === 'tr' ? 'Güvenlik' : finalLocale === 'fr' ? 'Sécurité' : 'Security',
                  desc: finalLocale === 'tr' ? 'Verilerinizin güvenliği en yüksek önceliğimiz' : finalLocale === 'fr' ? 'La sécurité des données est notre plus haute priorité' : 'Data security is our highest priority'
                },
                {
                  icon: <BoltIcon className="h-8 w-8" />,
                  title: finalLocale === 'tr' ? 'Hızlı' : finalLocale === 'fr' ? 'Rapide' : 'Fast',
                  desc: finalLocale === 'tr' ? 'Maksimum performans ve hız sunuyoruz' : finalLocale === 'fr' ? 'Nous offrons des performances et une vitesse maximales' : 'We provide maximum performance and speed'
                },
                {
                  icon: <CheckCircleIcon className="h-8 w-8" />,
                  title: finalLocale === 'tr' ? 'Kalite' : finalLocale === 'fr' ? 'Qualité' : 'Quality',
                  desc: finalLocale === 'tr' ? 'Yüksek kaliteli çıktılar garanti ediyoruz' : finalLocale === 'fr' ? 'Nous garantissons des sorties de haute qualité' : 'We guarantee high-quality outputs'
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