import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
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
    es: 'Acerca de | QuickUtil.app - Herramientas Gratuitas de PDF y Procesamiento',
    fr: 'À Propos | QuickUtil.app - Outils Gratuits de PDF et Traitement',
    de: 'Über Uns | QuickUtil.app - Kostenlose PDF- und Dateiverarbeitungstools',
    ar: 'من نحن | QuickUtil.app - أدوات مجانية لمعالجة PDF والملفات',
    ja: '会社概要 | QuickUtil.app - 無料PDFおよびファイル処理ツール',
    ko: '회사 소개 | QuickUtil.app - 무료 PDF 및 파일 처리 도구'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: 'QuickUtil.app team information and our mission.',
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);

  const teamValues = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: locale === 'tr' ? 'Kullanıcı Odaklı' : locale === 'en' ? 'User Focused' : locale === 'es' ? 'Enfocado en el Usuario' : locale === 'fr' ? 'Centré sur l\'Utilisateur' : locale === 'de' ? 'Benutzerorientiert' : locale === 'ar' ? 'محور المستخدم' : locale === 'ja' ? 'ユーザー重視' : '사용자 중심',
      description: locale === 'tr' ? 'Her zaman kullanıcı deneyimini önceleyerek, ihtiyaçları doğrultusunda hizmet geliştiriyoruz.' : locale === 'en' ? 'We always prioritize user experience and develop services according to their needs.' : locale === 'es' ? 'Siempre priorizamos la experiencia del usuario y desarrollamos servicios según sus necesidades.' : locale === 'fr' ? 'Nous priorisons toujours l\'expérience utilisateur et développons des services selon leurs besoins.' : locale === 'de' ? 'Wir priorisieren immer die Benutzererfahrung und entwickeln Dienste entsprechend ihren Bedürfnissen.' : locale === 'ar' ? 'نحن نعطي الأولوية دائماً لتجربة المستخدم ونطور الخدمات وفقاً لاحتياجاتهم.' : locale === 'ja' ? '私たちは常にユーザーエクスペリエンスを優先し、ニーズに応じてサービスを開発します。' : '우리는 항상 사용자 경험을 우선시하고 그들의 요구에 따라 서비스를 개발합니다.'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: locale === 'tr' ? 'Güvenlik & Gizlilik' : locale === 'en' ? 'Security & Privacy' : locale === 'es' ? 'Seguridad y Privacidad' : locale === 'fr' ? 'Sécurité et Confidentialité' : locale === 'de' ? 'Sicherheit & Datenschutz' : locale === 'ar' ? 'الأمان والخصوصية' : locale === 'ja' ? 'セキュリティとプライバシー' : '보안 및 개인정보보호',
      description: locale === 'tr' ? 'Kullanıcı verilerinin korunması ve dosya güvenliği en önemli önceliğimizdir.' : locale === 'en' ? 'Protection of user data and file security is our top priority.' : locale === 'es' ? 'La protección de datos del usuario y la seguridad de archivos es nuestra máxima prioridad.' : locale === 'fr' ? 'La protection des données utilisateur et la sécurité des fichiers est notre priorité absolue.' : locale === 'de' ? 'Der Schutz von Benutzerdaten und Dateisicherheit ist unsere oberste Priorität.' : locale === 'ar' ? 'حماية بيانات المستخدم وأمان الملفات هو أولويتنا القصوى.' : locale === 'ja' ? 'ユーザーデータの保護とファイルセキュリティが最優先事項です。' : '사용자 데이터 보호와 파일 보안이 최우선 과제입니다.'
    },
    {
      icon: <BoltIcon className="h-8 w-8" />,
      title: locale === 'tr' ? 'Hız & Verimlilik' : locale === 'en' ? 'Speed & Efficiency' : locale === 'es' ? 'Velocidad y Eficiencia' : locale === 'fr' ? 'Vitesse et Efficacité' : locale === 'de' ? 'Geschwindigkeit & Effizienz' : locale === 'ar' ? 'السرعة والكفاءة' : locale === 'ja' ? 'スピードと効率' : '속도 및 효율성',
      description: locale === 'tr' ? 'Hızlı, güvenilir ve verimli çözümlerle zamandan tasarruf sağlıyoruz.' : locale === 'en' ? 'We save time with fast, reliable and efficient solutions.' : locale === 'es' ? 'Ahorramos tiempo con soluciones rápidas, confiables y eficientes.' : locale === 'fr' ? 'Nous économisons du temps avec des solutions rapides, fiables et efficaces.' : locale === 'de' ? 'Wir sparen Zeit mit schnellen, zuverlässigen und effizienten Lösungen.' : locale === 'ar' ? 'نوفر الوقت بحلول سريعة وموثوقة وفعالة.' : locale === 'ja' ? '高速で信頼性があり効率的なソリューションで時間を節約します。' : '빠르고 신뢰할 수 있으며 효율적인 솔루션으로 시간을 절약합니다.'
    },
    {
      icon: <CloudArrowUpIcon className="h-8 w-8" />,
      title: locale === 'tr' ? 'Sürekli İnovasyon' : locale === 'en' ? 'Continuous Innovation' : locale === 'es' ? 'Innovación Continua' : locale === 'fr' ? 'Innovation Continue' : locale === 'de' ? 'Kontinuierliche Innovation' : locale === 'ar' ? 'الابتكار المستمر' : locale === 'ja' ? '継続的なイノベーション' : '지속적인 혁신',
      description: locale === 'tr' ? 'Teknolojideki gelişmeleri takip ederek sürekli yenilik yapıyoruz.' : locale === 'en' ? 'We continuously innovate by following technological developments.' : locale === 'es' ? 'Innovamos continuamente siguiendo los desarrollos tecnológicos.' : locale === 'fr' ? 'Nous innovons en permanence en suivant les développements technologiques.' : locale === 'de' ? 'Wir innovieren kontinuierlich, indem wir technologische Entwicklungen verfolgen.' : locale === 'ar' ? 'نبتكر باستمرار من خلال متابعة التطورات التكنولوجية.' : locale === 'ja' ? '技術的発展を追いながら継続的にイノベーションを行います。' : '기술 발전을 따라가며 지속적으로 혁신합니다.'
    }
  ];

  const statistics = [
    { 
      label: locale === 'tr' ? 'Toplam Kullanıcı' : locale === 'en' ? 'Total Users' : locale === 'es' ? 'Usuarios Totales' : locale === 'fr' ? 'Utilisateurs Totaux' : locale === 'de' ? 'Gesamtbenutzer' : locale === 'ar' ? 'إجمالي المستخدمين' : locale === 'ja' ? '総ユーザー数' : '총 사용자', 
      value: '10,000+', 
      icon: <UserGroupIcon className="h-6 w-6" /> 
    },
    { 
      label: locale === 'tr' ? 'İşlenen Dosya' : locale === 'en' ? 'Processed Files' : locale === 'es' ? 'Archivos Procesados' : locale === 'fr' ? 'Fichiers Traités' : locale === 'de' ? 'Verarbeitete Dateien' : locale === 'ar' ? 'الملفات المعالجة' : locale === 'ja' ? '処理済みファイル' : '처리된 파일', 
      value: '50,000+', 
      icon: <CloudArrowUpIcon className="h-6 w-6" /> 
    },
    { 
      label: locale === 'tr' ? 'Desteklenen Format' : locale === 'en' ? 'Supported Formats' : locale === 'es' ? 'Formatos Soportados' : locale === 'fr' ? 'Formats Supportés' : locale === 'de' ? 'Unterstützte Formate' : locale === 'ar' ? 'التنسيقات المدعومة' : locale === 'ja' ? 'サポート形式' : '지원 형식', 
      value: '15+', 
      icon: <CheckCircleIcon className="h-6 w-6" /> 
    },
    { 
      label: locale === 'tr' ? 'Ülke Erişimi' : locale === 'en' ? 'Country Access' : locale === 'es' ? 'Acceso por País' : locale === 'fr' ? 'Accès par Pays' : locale === 'de' ? 'Länderzugriff' : locale === 'ar' ? 'الوصول بالدولة' : locale === 'ja' ? '国別アクセス' : '국가별 액세스', 
      value: '50+', 
      icon: <BoltIcon className="h-6 w-6" /> 
    }
  ];

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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          
          {/* Company Info */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'tr' ? 'QuickUtil.app Kimiz?' : 
                 locale === 'en' ? 'Who is QuickUtil.app?' :
                 locale === 'es' ? '¿Quién es QuickUtil.app?' :
                 locale === 'fr' ? 'Qui est QuickUtil.app?' :
                 locale === 'de' ? 'Wer ist QuickUtil.app?' :
                 locale === 'ar' ? 'من هو QuickUtil.app؟' :
                 locale === 'ja' ? 'QuickUtil.appとは？' :
                 'QuickUtil.app은 누구입니까?'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{(t as any)['about.mission']}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {locale === 'tr' ? 'QuickUtil.app olarak misyonumuz, dünya çapında kullanıcılara en hızlı, güvenli ve kullanıcı dostu dosya işleme araçlarını tamamen ücretsiz olarak sunmaktır.' : 
                   locale === 'en' ? 'As QuickUtil.app, our mission is to provide the fastest, most secure and user-friendly file processing tools to users worldwide, completely free of charge.' :
                   locale === 'es' ? 'Como QuickUtil.app, nuestra misión es proporcionar las herramientas de procesamiento de archivos más rápidas, seguras y fáciles de usar a usuarios de todo el mundo, completamente gratis.' :
                   locale === 'fr' ? 'En tant que QuickUtil.app, notre mission est de fournir les outils de traitement de fichiers les plus rapides, sécurisés et conviviaux aux utilisateurs du monde entier, entièrement gratuits.' :
                   locale === 'de' ? 'Als QuickUtil.app ist es unsere Mission, Benutzern weltweit die schnellsten, sichersten und benutzerfreundlichsten Dateiverarbeitungstools völlig kostenlos anzubieten.' :
                   locale === 'ar' ? 'كـ QuickUtil.app، مهمتنا هي توفير أسرع وأكثر أدوات معالجة الملفات أماناً وسهولة في الاستخدام للمستخدمين في جميع أنحاء العالم، مجاناً تماماً.' :
                   locale === 'ja' ? 'QuickUtil.appとして、世界中のユーザーに最も高速で安全かつユーザーフレンドリーなファイル処理ツールを完全無料で提供することが私たちの使命です。' :
                   'QuickUtil.app으로서, 전 세계 사용자에게 가장 빠르고 안전하며 사용자 친화적인 파일 처리 도구를 완전 무료로 제공하는 것이 우리의 사명입니다.'}
                </p>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{(t as any)['about.vision']}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {locale === 'tr' ? 'Dijital dünyada dosya yönetiminin standartlarını belirleyen, güvenilir ve inovatif çözümler sunan global platform olmak vizyonumuzdur.' :
                   locale === 'en' ? 'Our vision is to become a global platform that sets the standards for file management in the digital world and offers reliable and innovative solutions.' :
                   locale === 'es' ? 'Nuestra visión es convertirnos en una plataforma global que establezca los estándares para la gestión de archivos en el mundo digital y ofrezca soluciones confiables e innovadoras.' :
                   locale === 'fr' ? 'Notre vision est de devenir une plateforme mondiale qui définit les normes de gestion de fichiers dans le monde numérique et offre des solutions fiables et innovantes.' :
                   locale === 'de' ? 'Unsere Vision ist es, eine globale Plattform zu werden, die Standards für das Dateimanagement in der digitalen Welt setzt und zuverlässige und innovative Lösungen bietet.' :
                   locale === 'ar' ? 'رؤيتنا هي أن نصبح منصة عالمية تضع معايير إدارة الملفات في العالم الرقمي وتقدم حلولاً موثوقة ومبتكرة.' :
                   locale === 'ja' ? '私たちのビジョンは、デジタル世界でファイル管理の標準を設定し、信頼性が高く革新的なソリューションを提供するグローバルプラットフォームになることです。' :
                   '우리의 비전은 디지털 세계에서 파일 관리의 표준을 설정하고 신뢰할 수 있는 혁신적인 솔루션을 제공하는 글로벌 플랫폼이 되는 것입니다.'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 {(t as any)['about.companyInfo']}</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Platform:</strong> QuickUtil.app</p>
                  <p><strong>{locale === 'tr' ? 'Kuruluş' : locale === 'en' ? 'Founded' : locale === 'es' ? 'Fundado' : locale === 'fr' ? 'Fondé' : locale === 'de' ? 'Gegründet' : locale === 'ar' ? 'تأسست' : locale === 'ja' ? '設立' : '설립'}:</strong> 2024</p>
                  <p><strong>{locale === 'tr' ? 'Lokasyon' : locale === 'en' ? 'Location' : locale === 'es' ? 'Ubicación' : locale === 'fr' ? 'Emplacement' : locale === 'de' ? 'Standort' : locale === 'ar' ? 'الموقع' : locale === 'ja' ? '所在地' : '위치'}:</strong> İstanbul, {locale === 'tr' ? 'Türkiye' : 'Turkey'}</p>
                  <p><strong>E-posta:</strong> hello@quickutil.app</p>
                  <p><strong>Website:</strong> https://quickutil.app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 {(t as any)['about.statistics']}</h2>
              <p className="text-lg text-gray-600">
                {locale === 'tr' ? 'Platformumuzun büyüyen ekosistemi' : 
                 locale === 'en' ? 'Our growing platform ecosystem' :
                 locale === 'es' ? 'Nuestro ecosistema de plataforma en crecimiento' :
                 locale === 'fr' ? 'Notre écosystème de plateforme en croissance' :
                 locale === 'de' ? 'Unser wachsendes Plattform-Ökosystem' :
                 locale === 'ar' ? 'نظامنا البيئي للمنصة المتنامي' :
                 locale === 'ja' ? '成長するプラットフォームエコシステム' :
                 '성장하는 플랫폼 생태계'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex justify-center text-blue-600 mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Values */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎯 {(t as any)['about.values']}</h2>
              <p className="text-lg text-gray-600">
                {locale === 'tr' ? 'Bizi özel kılan temel prensiplerimiz' :
                 locale === 'en' ? 'The core principles that make us special' :
                 locale === 'es' ? 'Los principios fundamentales que nos hacen especiales' :
                 locale === 'fr' ? 'Les principes fondamentaux qui nous rendent spéciaux' :
                 locale === 'de' ? 'Die Grundprinzipien, die uns besonders machen' :
                 locale === 'ar' ? 'المبادئ الأساسية التي تجعلنا مميزين' :
                 locale === 'ja' ? '私たちを特別にする核心原則' :
                 '우리를 특별하게 만드는 핵심 원칙'}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamValues.map((value, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200 hover:shadow-xl transition-shadow group">
                  <div className="flex justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services Overview */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🛠️ Sunduğumuz Hizmetler</h2>
              <p className="text-lg text-gray-600">Kapsamlı dosya işleme çözümleri</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📄 PDF Araçları</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• PDF Sıkıştırma - Dosya boyutunu %90'a kadar küçültme</li>
                  <li>• Format Dönüştürme - PDF ↔ Word, Excel, PowerPoint</li>
                  <li>• Sayfa İşlemleri - Birleştirme, ayırma, döndürme</li>
                  <li>• OCR Metin Çıkarma - Taranmış belgelerden metin</li>
                  <li>• PDF to Images - Sayfa bazlı görsel dönüştürme</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🖼️ Görsel Araçları</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Resim Sıkıştırma - Kaliteden ödün vermeden</li>
                  <li>• Format Dönüştürme - JPG, PNG, WebP, AVIF</li>
                  <li>• Boyutlandırma - Özel boyut ve oran ayarları</li>
                  <li>• Batch İşleme - Toplu dosya işleme</li>
                  <li>• Optimize Etme - Web ve mobil uyumlu</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <ShieldCheckIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🔒 Güvenlik & Gizlilik</h2>
              <p className="text-lg text-gray-600">Dosyalarınızın güvenliği önceliğimiz</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">SSL Şifrelemesi</h3>
                <p className="text-sm text-gray-600">256-bit SSL ile güvenli veri transferi</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <CloudArrowUpIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Otomatik Silme</h3>
                <p className="text-sm text-gray-600">İşlem sonrası dosyalar güvenle silinir</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <CheckCircleIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">KVKK Uyumlu</h3>
                <p className="text-sm text-gray-600">Veri koruma yasalarına tam uyum</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">🌟 Neden QuickUtil.app?</h2>
              <p className="text-lg opacity-90">Tercih edilme sebelerimiz</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">✅ Avantajlarımız</h3>
                <ul className="space-y-2 opacity-90">
                  <li>• %100 Ücretsiz - Hiçbir ödeme yok</li>
                  <li>• Kayıt gerektirmez - Hemen kullanın</li>
                  <li>• Sınırsız kullanım - Günlük limit yok</li>
                  <li>• Yüksek kalite - Profesyonel sonuçlar</li>
                  <li>• Hızlı işlem - Saniyeler içinde sonuç</li>
                  <li>• Mobil uyumlu - Her cihazda çalışır</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">🎯 Hedef Kitlemiz</h3>
                <ul className="space-y-2 opacity-90">
                  <li>• Öğrenciler - Ödev ve proje hazırlığı</li>
                  <li>• Profesyoneller - İş dokümantasyonu</li>
                  <li>• Öğretmenler - Eğitim materyalleri</li>
                  <li>• Freelancerlar - Müşteri projeleri</li>
                  <li>• KOBİ'ler - Günlük iş operasyonları</li>
                  <li>• Bireysel kullanıcılar - Kişisel ihtiyaçlar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📞 {(t as any)['about.contact']}</h2>
              <p className="text-lg text-gray-600">
                {locale === 'tr' ? 'Size nasıl yardımcı olabiliriz?' :
                 locale === 'en' ? 'How can we help you?' :
                 locale === 'es' ? '¿Cómo podemos ayudarte?' :
                 locale === 'fr' ? 'Comment pouvons-nous vous aider?' :
                 locale === 'de' ? 'Wie können wir Ihnen helfen?' :
                 locale === 'ar' ? 'كيف يمكننا مساعدتك؟' :
                 locale === 'ja' ? 'どのようにお手伝いできますか？' :
                 '어떻게 도와드릴까요?'}
              </p>
            </div>
            
            <div className="text-center text-gray-600 mb-4">
              <p><strong>E-posta:</strong> hello@quickutil.app</p>
              <p><strong>Website:</strong> https://quickutil.app</p>
            </div>
            
            <div className="border-t border-gray-200 pt-8 mt-8 text-center">
              <p className="text-sm text-gray-500">
                <strong>
                  {locale === 'tr' ? 'Son Güncelleme' : 
                   locale === 'en' ? 'Last Updated' :
                   locale === 'es' ? 'Última Actualización' :
                   locale === 'fr' ? 'Dernière Mise à Jour' :
                   locale === 'de' ? 'Zuletzt Aktualisiert' :
                   locale === 'ar' ? 'آخر تحديث' :
                   locale === 'ja' ? '最終更新' :
                   '마지막 업데이트'}:
                </strong> {new Date().toLocaleDateString(locale)} • 
                <strong> {locale === 'tr' ? 'İletişim' : locale === 'en' ? 'Contact' : locale === 'es' ? 'Contacto' : locale === 'fr' ? 'Contact' : locale === 'de' ? 'Kontakt' : locale === 'ar' ? 'اتصال' : locale === 'ja' ? '連絡先' : '연락처'}:</strong> hello@quickutil.app
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
} 