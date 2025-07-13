import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
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
    tr: 'Gizlilik Sözleşmesi | QuickUtil.app',
    en: 'Privacy Policy | QuickUtil.app',
    es: 'Política de Privacidad | QuickUtil.app',
    fr: 'Politique de Confidentialité | QuickUtil.app',
    de: 'Datenschutzrichtlinie | QuickUtil.app',
    ar: 'سياسة الخصوصية | QuickUtil.app',
    ja: 'プライバシーポリシー | QuickUtil.app',
    ko: '개인정보 처리방침 | QuickUtil.app'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: 'QuickUtil.app privacy policy and data protection information.',
  };
}

export default async function PrivacyPage({ params }: Props) {
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🔒 {getText('privacy.title', 'Gizlilik Sözleşmesi')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {getText('privacy.subtitle', 'QuickUtil.app\'te kişisel verilerin korunması ve işlenmesi hakkında bilgiler')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 space-y-12">
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{getText('privacy.dataController', 'Veri Sorumlusu')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {getText('privacy.introContent', 'Bu Gizlilik Sözleşmesi, QuickUtil.app platformu kullanıcılarının kişisel verilerinin korunması ve işlenmesi hakkında bilgi vermek amacıyla hazırlanmıştır. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla faaliyet göstermekteyiz.')}
            </p>
          </div>

          {/* Data Collection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <UserCircleIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{getText('privacy.collectedData', 'Toplanan Veriler')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getText('privacy.accountInfo.title', 'Hesap Bilgileri:')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {getText('privacy.accountInfo.desc', 'E-posta adresi, ad-soyad, hesap oluşturma tarihi ve son giriş bilgileri.')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getText('privacy.fileInfo.title', 'Dosya Bilgileri:')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {getText('privacy.fileInfo.desc', 'Yüklenen dosyaların boyutu, türü, işleme tarihi ve süreleri. Dosya içerikleri işlem sonrası otomatik olarak silinir.')}
                </p>
              </div>
            </div>
          </div>

          {/* Data Processing */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ClockIcon className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{getText('privacy.processingPurpose', 'İşleme Amacı')}</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {getText('privacy.purpose1', 'Platform hizmetlerinin sunulması ve kullanıcı deneyiminin iyileştirilmesi')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {getText('privacy.purpose2', 'Teknik destek sağlanması ve sorunların çözülmesi')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {getText('privacy.purpose3', 'Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi')}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {getText('privacy.purpose4', 'Yasal yükümlülüklerin yerine getirilmesi')}
              </li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <LockClosedIcon className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{getText('privacy.dataSecurity', 'Veri Güvenliği')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {getText('privacy.securityContent', 'Kişisel verilerinizin güvenliği en yüksek önceliğimizdir. 256-bit SSL şifreleme, güvenli sunucular ve düzenli güvenlik denetimleri ile verilerinizi koruyoruz.')}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: getText('privacy.sslTitle', 'SSL Şifreleme'),
                  desc: getText('privacy.sslDesc', '256-bit güvenlik')
                },
                {
                  title: getText('privacy.serversTitle', 'Güvenli Sunucular'),
                  desc: getText('privacy.serversDesc', 'Firebase altyapısı')
                },
                {
                  title: getText('privacy.deletionTitle', 'Otomatik Silme'),
                  desc: getText('privacy.deletionDesc', '30 gün sonra')
                }
              ].map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Rights */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{getText('privacy.userRights', 'Kullanıcı Hakları')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {getText('privacy.rightsContent', 'KVKK kapsamında sahip olduğunuz haklar:')}
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {getText('privacy.right1', 'Kişisel verilerinizin işlenip işlenmediğini öğrenme')}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {getText('privacy.right2', 'İşlenen verileriniz hakkında bilgi talep etme')}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {getText('privacy.right3', 'Verilerinizin düzeltilmesini veya silinmesini isteme')}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {getText('privacy.right4', 'Veri işlemeye itiraz etme ve şikayet başvurusu yapma')}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {getText('privacy.contactTitle', 'İletişim')}
            </h3>
            <p className="text-gray-700 mb-4">
              {getText('privacy.contactContent', 'Gizlilik sözleşmesi hakkında sorularınız için:')}
            </p>
            <div className="inline-flex items-center bg-white rounded-lg px-6 py-3 shadow-sm">
              <span className="text-blue-600 font-medium">hello@quickutil.app</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 