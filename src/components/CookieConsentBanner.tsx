'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { XMarkIcon, CogIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';

interface CookieConsentBannerProps {
  className?: string;
}

export default function CookieConsentBanner({ className }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    advertising: false,
    personalization: false,
  });

  // Get current locale from pathname
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const t = getTranslations(locale) as any;

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('quickutil_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      advertising: true,
      personalization: true,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('quickutil_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    
    // Initialize Google services if accepted
    if (typeof window !== 'undefined') {
      // Enable Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    }
  };

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('quickutil_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    
    // Update Google consent based on preferences
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.advertising ? 'granted' : 'denied',
        ad_user_data: preferences.advertising ? 'granted' : 'denied',
        ad_personalization: preferences.personalization ? 'granted' : 'denied',
      });
    }
  };

  const handleRejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      advertising: false,
      personalization: false,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('quickutil_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);

    // Deny all non-essential cookies
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  };

  // Get correct cookie policy URL based on locale
  const cookiePolicyUrl = `/${locale}/${t['footer.cookiesUrl'] || 'cookie-policy'}`;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        {!showSettings ? (
          // Main consent banner
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.cookieConsent?.title || '🍪 Çerez Kullanımı'}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {t.cookieConsent?.description || 'QuickUtil.app\'te deneyiminizi iyileştirmek için çerezler kullanıyoruz.'}{' '}
                  <a 
                    href={cookiePolicyUrl}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                  >
                    {t.cookieConsent?.policyLink || 'Cookie Politikamızı'}
                  </a>{' '}
                  {t.cookieConsent?.policyLinkText || 'inceleyebilirsiniz.'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  {t.cookieConsent?.manageSettings || 'Ayarları Yönet'}
                </button>
                
                <button
                  onClick={handleAcceptAll}
                  className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {t.cookieConsent?.acceptAll || 'Tümünü Kabul Et'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Settings panel
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t.cookieConsent?.settingsTitle || 'Çerez Tercihleri'}
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {t.cookieConsent?.necessary?.title || 'Gerekli Çerezler'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.cookieConsent?.necessary?.description || 'Bu çerezler web sitesinin temel işlevselliği için gereklidir.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {t.cookieConsent?.analytics?.title || 'Analiz Çerezleri'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.cookieConsent?.analytics?.description || 'Site kullanımını anlamamıza yardımcı olur.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {t.cookieConsent?.advertising?.title || 'Reklam Çerezleri'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.cookieConsent?.advertising?.description || 'Size daha alakalı reklamlar gösterebilmek için kullanılır.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(e) => setPreferences(prev => ({ ...prev, advertising: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {t.cookieConsent?.personalization?.title || 'Kişiselleştirme Çerezleri'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.cookieConsent?.personalization?.description || 'Deneyiminizi özelleştirmek için kullanılır.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.personalization}
                    onChange={(e) => setPreferences(prev => ({ ...prev, personalization: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t.cookieConsent?.rejectAll || 'Tümünü Reddet'}
              </button>
              
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {t.cookieConsent?.savePreferences || 'Tercihleri Kaydet'}
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                {t.cookieConsent?.acceptAll || 'Tümünü Kabul Et'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 