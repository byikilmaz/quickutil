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
                🔒 {(t as any)['privacy.title']}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {(t as any)['privacy.subtitle']}
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
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.dataController']}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'Bu Gizlilik Sözleşmesi, QuickUtil.app platformu kullanıcılarının kişisel verilerinin korunması ve işlenmesi hakkında bilgi vermek amacıyla hazırlanmıştır. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla faaliyet göstermekteyiz.' :
                finalLocale === 'fr' ?
                'Cette Politique de Confidentialité est préparée pour informer les utilisateurs de la plateforme QuickUtil.app sur la protection et le traitement des données personnelles. Nous opérons en tant que responsable de traitement sous les lois applicables de protection de la vie privée, y compris le RGPD.' :
                'This Privacy Policy is prepared to inform QuickUtil.app platform users about the protection and processing of personal data. We operate as a data controller under applicable privacy laws including GDPR.'
              }
            </p>
          </div>

          {/* Data Collection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <UserCircleIcon className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.collectedData']}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'Hesap Bilgileri:' : finalLocale === 'fr' ? 'Informations de Compte :' : 'Account Information:'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'E-posta adresi, ad-soyad, hesap oluşturma tarihi ve son giriş bilgileri.' :
                    finalLocale === 'fr' ?
                    'Adresse e-mail, prénom et nom, date de création du compte et informations de dernière connexion.' :
                    'Email address, first and last name, account creation date and last login information.'
                  }
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {finalLocale === 'tr' ? 'Dosya Bilgileri:' : finalLocale === 'fr' ? 'Informations de Fichier :' : 'File Information:'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {finalLocale === 'tr' ? 
                    'Yüklenen dosyaların boyutu, türü, işleme tarihi ve süreleri. Dosya içerikleri işlem sonrası otomatik olarak silinir.' :
                    finalLocale === 'fr' ?
                    'Taille, type, date et durée de traitement des fichiers téléchargés. Le contenu des fichiers est automatiquement supprimé après traitement.' :
                    'Size, type, processing date and duration of uploaded files. File contents are automatically deleted after processing.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Data Processing */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ClockIcon className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.processingPurpose']}</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {finalLocale === 'tr' ? 
                  'Platform hizmetlerinin sunulması ve kullanıcı deneyiminin iyileştirilmesi' :
                  finalLocale === 'fr' ?
                  'Fourniture des services de plateforme et amélioration de l\'expérience utilisateur' :
                  'Providing platform services and improving user experience'
                }
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {finalLocale === 'tr' ? 
                  'Teknik destek sağlanması ve sorunların çözülmesi' :
                  finalLocale === 'fr' ?
                  'Fourniture du support technique et résolution des problèmes' :
                  'Providing technical support and solving problems'
                }
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {finalLocale === 'tr' ? 
                  'Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi' :
                  finalLocale === 'fr' ?
                  'Assurer la sécurité de la plateforme et prévenir les abus' :
                  'Ensuring platform security and preventing misuse'
                }
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {finalLocale === 'tr' ? 
                  'Yasal yükümlülüklerin yerine getirilmesi' :
                  finalLocale === 'fr' ?
                  'Accomplissement des obligations légales' :
                  'Fulfilling legal obligations'
                }
              </li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <LockClosedIcon className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.dataSecurity']}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'Kişisel verilerinizin güvenliği en yüksek önceliğimizdir. 256-bit SSL şifreleme, güvenli sunucular ve düzenli güvenlik denetimleri ile verilerinizi koruyoruz.' :
                'The security of your personal data is our highest priority. We protect your data with 256-bit SSL encryption, secure servers and regular security audits.'
              }
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: finalLocale === 'tr' ? 'SSL Şifreleme' : 'SSL Encryption',
                  desc: finalLocale === 'tr' ? '256-bit güvenlik' : '256-bit security'
                },
                {
                  title: finalLocale === 'tr' ? 'Güvenli Sunucular' : 'Secure Servers',
                  desc: finalLocale === 'tr' ? 'Firebase altyapısı' : 'Firebase infrastructure'
                },
                {
                  title: finalLocale === 'tr' ? 'Otomatik Silme' : 'Auto Deletion',
                  desc: finalLocale === 'tr' ? '30 gün sonra' : 'After 30 days'
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
              <h2 className="text-2xl font-bold text-gray-900">{(t as any)['privacy.userRights']}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {finalLocale === 'tr' ? 
                'KVKK kapsamında sahip olduğunuz haklar:' :
                'Your rights under privacy laws:'
              }
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {finalLocale === 'tr' ? 
                  'Kişisel verilerinizin işlenip işlenmediğini öğrenme' :
                  'Learning whether your personal data is processed'
                }
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {finalLocale === 'tr' ? 
                  'İşlenen verileriniz hakkında bilgi talep etme' :
                  'Requesting information about your processed data'
                }
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {finalLocale === 'tr' ? 
                  'Verilerinizin düzeltilmesini veya silinmesini isteme' :
                  'Requesting correction or deletion of your data'
                }
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {finalLocale === 'tr' ? 
                  'Veri işlemeye itiraz etme ve şikayet başvurusu yapma' :
                  'Objecting to data processing and filing complaints'
                }
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {finalLocale === 'tr' ? 'İletişim' : 'Contact'}
            </h3>
            <p className="text-gray-700 mb-4">
              {finalLocale === 'tr' ? 
                'Gizlilik sözleşmesi hakkında sorularınız için:' :
                'For questions about our privacy policy:'
              }
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