import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  CogIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CookiePolicyPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'tr';
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
                🍪 {t.cookiePolicy.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.cookiePolicy.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          
          {/* What are Cookies */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t.cookiePolicy.whatAreCookies}</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 'Çerezler (cookies), web sitelerinin ziyaretçiler hakkında bilgi toplamasını ve hatırlamasını sağlayan küçük metin dosyalarıdır. QuickUtil.app, kullanıcı deneyimini iyileştirmek ve hizmetlerimizi optimize etmek için çerezler kullanır.' :
               locale === 'en' ? 'Cookies are small text files that allow websites to collect and remember information about visitors. QuickUtil.app uses cookies to improve user experience and optimize our services.' :
               locale === 'es' ? 'Las cookies son pequeños archivos de texto que permiten a los sitios web recopilar y recordar información sobre los visitantes. QuickUtil.app utiliza cookies para mejorar la experiencia del usuario y optimizar nuestros servicios.' :
               locale === 'fr' ? 'Les cookies sont de petits fichiers texte qui permettent aux sites web de collecter et de se souvenir d\'informations sur les visiteurs. QuickUtil.app utilise des cookies pour améliorer l\'expérience utilisateur et optimiser nos services.' :
               locale === 'de' ? 'Cookies sind kleine Textdateien, die es Websites ermöglichen, Informationen über Besucher zu sammeln und zu speichern. QuickUtil.app verwendet Cookies, um die Benutzererfahrung zu verbessern und unsere Dienste zu optimieren.' :
               locale === 'ar' ? 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تسمح لمواقع الويب بجمع وتذكر معلومات حول الزوار. يستخدم QuickUtil.app ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحسين خدماتنا.' :
               locale === 'ja' ? 'Cookieは、ウェブサイトが訪問者に関する情報を収集し記憶することを可能にする小さなテキストファイルです。QuickUtil.appは、ユーザーエクスペリエンスを向上させ、サービスを最適化するためにCookieを使用します。' :
               'Cookie는 웹사이트가 방문자에 대한 정보를 수집하고 기억할 수 있게 해주는 작은 텍스트 파일입니다. QuickUtil.app은 사용자 경험을 개선하고 서비스를 최적화하기 위해 Cookie를 사용합니다.'}
            </p>
          </div>

          {/* Cookie Types */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t.cookiePolicy.typesOfCookies}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-6 py-3">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'tr' ? '✅ Gerekli Çerezler' :
                     locale === 'en' ? '✅ Essential Cookies' :
                     locale === 'es' ? '✅ Cookies Esenciales' :
                     locale === 'fr' ? '✅ Cookies Essentiels' :
                     locale === 'de' ? '✅ Wesentliche Cookies' :
                     locale === 'ar' ? '✅ ملفات تعريف الارتباط الأساسية' :
                     locale === 'ja' ? '✅ 必須Cookie' :
                     '✅ 필수 Cookie'}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {locale === 'tr' ? 'Sitenin temel işlevselliği için gerekli çerezler.' :
                     locale === 'en' ? 'Cookies necessary for the basic functionality of the site.' :
                     locale === 'es' ? 'Cookies necesarias para la funcionalidad básica del sitio.' :
                     locale === 'fr' ? 'Cookies nécessaires pour les fonctionnalités de base du site.' :
                     locale === 'de' ? 'Cookies, die für die grundlegenden Funktionen der Website erforderlich sind.' :
                     locale === 'ar' ? 'ملفات تعريف الارتباط اللازمة للوظائف الأساسية للموقع.' :
                     locale === 'ja' ? 'サイトの基本機能に必要なCookie。' :
                     '사이트의 기본 기능에 필요한 Cookie.'}
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'tr' ? '📊 Analitik Çerezler' :
                     locale === 'en' ? '📊 Analytics Cookies' :
                     locale === 'es' ? '📊 Cookies de Análisis' :
                     locale === 'fr' ? '📊 Cookies Analytiques' :
                     locale === 'de' ? '📊 Analytische Cookies' :
                     locale === 'ar' ? '📊 ملفات تعريف الارتباط التحليلية' :
                     locale === 'ja' ? '📊 分析Cookie' :
                     '📊 분석 Cookie'}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {locale === 'tr' ? 'Site kullanımı ve performansı analizi için.' :
                     locale === 'en' ? 'For analyzing site usage and performance.' :
                     locale === 'es' ? 'Para analizar el uso y rendimiento del sitio.' :
                     locale === 'fr' ? 'Pour analyser l\'utilisation et les performances du site.' :
                     locale === 'de' ? 'Zur Analyse der Website-Nutzung und -Leistung.' :
                     locale === 'ar' ? 'لتحليل استخدام الموقع والأداء.' :
                     locale === 'ja' ? 'サイトの利用状況とパフォーマンスを分析するため。' :
                     '사이트 사용량 및 성능 분석을 위해.'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-6 py-3">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'tr' ? '⚙️ İşlevsellik Çerezleri' :
                     locale === 'en' ? '⚙️ Functionality Cookies' :
                     locale === 'es' ? '⚙️ Cookies de Funcionalidad' :
                     locale === 'fr' ? '⚙️ Cookies de Fonctionnalité' :
                     locale === 'de' ? '⚙️ Funktionalitäts-Cookies' :
                     locale === 'ar' ? '⚙️ ملفات تعريف الارتباط الوظيفية' :
                     locale === 'ja' ? '⚙️ 機能Cookie' :
                     '⚙️ 기능 Cookie'}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {locale === 'tr' ? 'Kullanıcı tercihlerini hatırlama için.' :
                     locale === 'en' ? 'For remembering user preferences.' :
                     locale === 'es' ? 'Para recordar las preferencias del usuario.' :
                     locale === 'fr' ? 'Pour se souvenir des préférences utilisateur.' :
                     locale === 'de' ? 'Zum Merken von Benutzerpräferenzen.' :
                     locale === 'ar' ? 'لتذكر تفضيلات المستخدم.' :
                     locale === 'ja' ? 'ユーザー設定を記憶するため。' :
                     '사용자 설정을 기억하기 위해.'}
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locale === 'tr' ? '🎯 Hedefleme Çerezleri' :
                     locale === 'en' ? '🎯 Targeting Cookies' :
                     locale === 'es' ? '🎯 Cookies de Orientación' :
                     locale === 'fr' ? '🎯 Cookies de Ciblage' :
                     locale === 'de' ? '🎯 Targeting-Cookies' :
                     locale === 'ar' ? '🎯 ملفات تعريف الارتباط المستهدفة' :
                     locale === 'ja' ? '🎯 ターゲティングCookie' :
                     '🎯 타겟팅 Cookie'}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {locale === 'tr' ? 'Kişiselleştirilmiş içerik sunumu için.' :
                     locale === 'en' ? 'For delivering personalized content.' :
                     locale === 'es' ? 'Para entregar contenido personalizado.' :
                     locale === 'fr' ? 'Pour fournir du contenu personnalisé.' :
                     locale === 'de' ? 'Für die Bereitstellung personalisierter Inhalte.' :
                     locale === 'ar' ? 'لتقديم محتوى مخصص.' :
                     locale === 'ja' ? 'パーソナライズされたコンテンツの提供のため。' :
                     '개인화된 콘텐츠 제공을 위해.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Management */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t.cookiePolicy.cookieManagement}</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {locale === 'tr' ? '🔧 Tarayıcı Ayarları' :
                 locale === 'en' ? '🔧 Browser Settings' :
                 locale === 'es' ? '🔧 Configuración del Navegador' :
                 locale === 'fr' ? '🔧 Paramètres du Navigateur' :
                 locale === 'de' ? '🔧 Browser-Einstellungen' :
                 locale === 'ar' ? '🔧 إعدادات المتصفح' :
                 locale === 'ja' ? '🔧 ブラウザ設定' :
                 '🔧 브라우저 설정'}
              </h3>
              <p className="text-gray-700 mb-4">
                {locale === 'tr' ? 'Çerezleri tarayıcı ayarlarından yönetebilirsiniz:' :
                 locale === 'en' ? 'You can manage cookies through your browser settings:' :
                 locale === 'es' ? 'Puedes gestionar las cookies a través de la configuración de tu navegador:' :
                 locale === 'fr' ? 'Vous pouvez gérer les cookies via les paramètres de votre navigateur :' :
                 locale === 'de' ? 'Sie können Cookies über Ihre Browser-Einstellungen verwalten:' :
                 locale === 'ar' ? 'يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات متصفحك:' :
                 locale === 'ja' ? 'ブラウザ設定からCookieを管理できます：' :
                 '브라우저 설정을 통해 Cookie를 관리할 수 있습니다:'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <ul className="space-y-1">
                  <li><strong>Chrome:</strong> {locale === 'tr' ? 'Ayarlar > Gizlilik ve güvenlik > Çerezler' : 'Settings > Privacy and security > Cookies'}</li>
                  <li><strong>Firefox:</strong> {locale === 'tr' ? 'Ayarlar > Gizlilik ve güvenlik > Çerezler' : 'Settings > Privacy & Security > Cookies'}</li>
                </ul>
                <ul className="space-y-1">
                  <li><strong>Safari:</strong> {locale === 'tr' ? 'Tercihler > Gizlilik > Çerezler' : 'Preferences > Privacy > Cookies'}</li>
                  <li><strong>Edge:</strong> {locale === 'tr' ? 'Ayarlar > Gizlilik ve hizmetler > Çerezler' : 'Settings > Privacy and services > Cookies'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📧 {t.cookiePolicy.contact}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {locale === 'tr' ? 'Çerez politikası ile ilgili sorularınız için' :
                 locale === 'en' ? 'For questions about our cookie policy' :
                 locale === 'es' ? 'Para preguntas sobre nuestra política de cookies' :
                 locale === 'fr' ? 'Pour toute question concernant notre politique de cookies' :
                 locale === 'de' ? 'Bei Fragen zu unserer Cookie-Richtlinie' :
                 locale === 'ar' ? 'للأسئلة حول سياسة ملفات تعريف الارتباط' :
                 locale === 'ja' ? 'Cookieポリシーに関するご質問' :
                 'Cookie 정책에 관한 질문'}
              </p>
              
              <div className="text-center text-gray-600 mb-6">
                <p><strong>E-posta:</strong> hello@quickutil.app</p>
                <p><strong>Website:</strong> https://quickutil.app</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6 text-center">
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
                  </strong> {new Date().toLocaleDateString(locale)}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
} 