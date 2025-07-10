import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  CogIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ClockIcon
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
    tr: 'Çerez Politikası | QuickUtil.app',
    en: 'Cookie Policy | QuickUtil.app',
    es: 'Política de Cookies | QuickUtil.app',
    fr: 'Politique de Cookies | QuickUtil.app',
    de: 'Cookie-Richtlinie | QuickUtil.app',
    ar: 'سياسة ملفات تعريف الارتباط | QuickUtil.app',
    ja: 'クッキーポリシー | QuickUtil.app',
    ko: '쿠키 정책 | QuickUtil.app'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: 'QuickUtil.app cookie policy and usage information.',
  };
}

export default async function CookiePolicyPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'en'; // Default to English for this page
  const t = getTranslations(finalLocale);

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <CogIcon className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🍪 {(t as any)['cookiePolicy.title']}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {(t as any)['cookiePolicy.subtitle']}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 space-y-12">
          {/* What are Cookies */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['cookiePolicy.whatAreCookies']}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'Çerezler (cookies), web sitelerinin ziyaretçiler hakkında bilgi toplamasını ve hatırlamasını sağlayan küçük metin dosyalarıdır. QuickUtil.app, kullanıcı deneyimini iyileştirmek ve hizmetlerimizi optimize etmek için çerezler kullanır.' :
                'Cookies are small text files that enable websites to collect and remember information about visitors. QuickUtil.app uses cookies to improve user experience and optimize our services.'
              }
            </p>
          </div>

          {/* Types of Cookies */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['cookiePolicy.typesOfCookies']}</h2>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'Gerekli Çerezler' : 'Essential Cookies'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'Web sitesinin temel işlevlerini sağlamak için gereklidir. Bu çerezler olmadan site düzgün çalışmaz.' :
                    'Required for the basic functions of the website. Without these cookies, the site cannot function properly.'
                  }
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'Performans Çerezleri' : 'Performance Cookies'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'Site performansını ölçmek ve kullanıcı deneyimini iyileştirmek için kullanılır.' :
                    'Used to measure site performance and improve user experience.'
                  }
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'İşlevsel Çerezler' : 'Functional Cookies'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'Kullanıcı tercihlerini hatırlamak ve kişiselleştirilmiş deneyim sunmak için kullanılır.' :
                    'Used to remember user preferences and provide personalized experiences.'
                  }
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'Analitik Çerezler' : 'Analytics Cookies'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'Site kullanımını analiz etmek ve hizmetlerimizi geliştirmek için anonim veri toplar.' :
                    'Collects anonymous data to analyze site usage and improve our services.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Management */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['cookiePolicy.cookieManagement']}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'Çerez ayarlarınızı browser üzerinden yönetebilirsiniz. Çerezleri devre dışı bırakmanız durumunda sitenin bazı özellikleri düzgün çalışmayabilir.' :
                'You can manage your cookie settings through your browser. If you disable cookies, some features of the site may not work properly.'
              }
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { browser: 'Chrome', color: 'bg-blue-50 text-blue-600' },
                { browser: 'Firefox', color: 'bg-orange-50 text-orange-600' },
                { browser: 'Safari', color: 'bg-gray-50 text-gray-600' },
                { browser: 'Edge', color: 'bg-green-50 text-green-600' }
              ].map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${item.color} text-center`}>
                  <h4 className="font-semibold mb-2">{item.browser}</h4>
                  <p className="text-sm">
                    {finalLocale === 'tr' ? 'Ayarlar > Gizlilik' : 'Settings > Privacy'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Third Party Cookies */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{(t as any)['cookiePolicy.thirdParty']}</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'QuickUtil.app, hizmet kalitesini artırmak için güvenilir üçüncü taraf servisleri kullanır:' :
                'QuickUtil.app uses trusted third-party services to improve service quality:'
              }
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">🔍</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Google Analytics</h4>
                  <p className="text-sm text-gray-600">
                    {finalLocale === 'tr' ? 
                      'Site trafiği ve kullanıcı davranışlarını analiz etmek için' :
                      'To analyze site traffic and user behavior'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-yellow-500 text-xl">🔥</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Firebase</h4>
                  <p className="text-sm text-gray-600">
                    {finalLocale === 'tr' ? 
                      'Kullanıcı kimlik doğrulama ve veri depolama için' :
                      'For user authentication and data storage'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-orange-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {finalLocale === 'tr' ? 'Politika Güncellemeleri' : 'Policy Updates'}
            </h3>
            <p className="text-gray-700 mb-4">
              {finalLocale === 'tr' ? 
                'Bu çerez politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayınlanacaktır.' :
                'This cookie policy may be updated from time to time. Changes will be published on this page.'
              }
            </p>
            <p className="text-sm text-gray-600">
              {finalLocale === 'tr' ? 
                'Son güncelleme: Aralık 2024' :
                'Last updated: December 2024'
              }
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {(t as any)['cookiePolicy.contact']}
            </h3>
            <p className="text-gray-700 mb-4">
              {finalLocale === 'tr' ? 
                'Çerez politikası hakkında sorularınız için:' :
                'For questions about our cookie policy:'
              }
            </p>
            <div className="inline-flex items-center bg-orange-50 rounded-lg px-6 py-3 shadow-sm">
              <span className="text-orange-600 font-medium">hello@quickutil.app</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 