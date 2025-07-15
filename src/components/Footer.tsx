'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import { CpuChipIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  
  // Extract locale from pathname
  const getCurrentLocale = (): string => {
    if (!pathname) return 'tr';
    const segments = pathname.split('/');
    const locales = ['tr', 'en', 'es', 'fr', 'de'];
    return locales.includes(segments[1]) ? segments[1] : 'tr';
  };
  
  const locale = getCurrentLocale();
  const t = useTranslations('footer', locale);
  
  // Araç sayfalarında koyu tema kullan
  const isToolPage = pathname?.includes('/pdf-') || pathname?.includes('/image-');
  const footerBg = isToolPage ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isToolPage ? 'text-gray-300' : 'text-gray-600';
  const titleColor = isToolPage ? 'text-white' : 'text-black';
  const borderColor = isToolPage ? 'border-gray-700' : 'border-gray-200';

  return (
    <footer className={`${footerBg} border-t ${borderColor}`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* AI-Powered Brand Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <Link href={`/${locale}`} className="flex items-center space-x-3 group mb-4">
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/logo.svg"
                alt="QuickUtil.app AI-Powered Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${titleColor} group-hover:text-blue-600 transition-colors duration-300`}>
                QuickUtil.app
              </span>
              {/* AI Badge */}
              <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                <CpuChipIcon className="h-3 w-3 mr-1" />
                AI
              </div>
            </div>
          </Link>
          
          {/* AI-Powered Tagline */}
          <p className={`text-sm ${textColor} text-center max-w-md`}>
            {t('aiTagline')}
          </p>
          
          {/* AI Technology Badges */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              <SparklesIcon className="h-3 w-3 mr-1" />
              TensorFlow.js
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
              <CpuChipIcon className="h-3 w-3 mr-1" />
              Machine Learning
            </div>
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              <SparklesIcon className="h-3 w-3 mr-1" />
              Neural Networks
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* AI-Powered Tools */}
          <div>
            <h4 className={`text-sm font-medium ${titleColor} mb-4 flex items-center`}>
              <CpuChipIcon className="h-4 w-4 mr-2" />
              {t('aiTools')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/pdf-compress`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover flex items-center`}
                >
                  <span className="mr-2">🤖</span> {t('aiPdfCompress')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/image-compress`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover flex items-center`}
                >
                  <span className="mr-2">✨</span> {t('aiImageCompress')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/image-batch`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover flex items-center`}
                >
                  <span className="mr-2">⚡</span> {t('aiBatchProcessing')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/blog`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover flex items-center`}
                >
                  <span className="mr-2">🧠</span> {t('aiBlog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={`text-sm font-medium ${titleColor} mb-4`}>{t('company')}</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/${t('aboutUrl')}`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover`}
                >
                  ℹ️ {t('about')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/hikayemiz`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover`}
                >
                  📖 {t('story')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/team`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover`}
                >
                  👥 {t('team')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/${t('privacyUrl')}`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover`}
                >
                  🔒 {t('privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/${t('cookiesUrl')}`} 
                  className={`${textColor} hover:${isToolPage ? 'text-white' : 'text-black'} text-sm apple-link-hover`}
                >
                  🍪 {t('cookies')}
                </Link>
              </li>
            </ul>
          </div>

          {/* AI-Enhanced Support */}
          <div>
            <h4 className={`text-sm font-medium ${titleColor} mb-4 flex items-center`}>
              <SparklesIcon className="h-4 w-4 mr-2" />
              {t('aiSupport')}
            </h4>
            <div className="space-y-3">
              <p className={`${textColor} text-sm`}>
                hello@quickutil.app
              </p>
              
              {/* AI-Powered Security Badge */}
              <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-2 text-white shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-medium">{t('aiSecure')}</span>
              </div>
              
              {/* AI Processing Badge */}
              <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg px-3 py-2 text-white shadow-sm hover:shadow-md transition-shadow">
                <CpuChipIcon className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">{t('aiProcessing')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Enhanced Bottom */}
        <div className={`border-t ${borderColor} pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center md:space-x-4 mb-4 md:mb-0">
              <p className={`text-sm ${textColor} mb-2 md:mb-0`}>
                &copy; {currentYear} {t('copyright')}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${textColor}`}>{t('poweredBy')}</span>
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                  <CpuChipIcon className="h-3 w-3 mr-1" />
                  AI
                </div>
              </div>
            </div>
            <p className={`text-sm ${textColor}`}>
              {t('country')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 