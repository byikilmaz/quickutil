'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { 
  changeLanguage, 
  type SupportedLocale, 
  supportedLocales 
} from '@/lib/languageDetection';

// Locale types and configuration
export type Locale = SupportedLocale;

export const locales: Locale[] = [...supportedLocales];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current locale from URL pathname
  const getCurrentLocale = (): Locale => {
    if (!pathname) return 'tr';
    const segments = pathname.split('/');
    const localeFromPath = segments[1] as Locale;
    const isValidLocale = locales.includes(localeFromPath);
    
    console.log('🔤 DEBUG - LanguageSwitcher getCurrentLocale:');
    console.log('  - pathname:', pathname);
    console.log('  - segments:', segments);
    console.log('  - localeFromPath:', localeFromPath);
    console.log('  - isValidLocale:', isValidLocale);
    
    return isValidLocale ? localeFromPath : 'tr';
  };

  const currentLocale = getCurrentLocale();

  // Enhanced debug logging
  console.log('🔤 DEBUG - LanguageSwitcher state:');
  console.log('  - currentLocale:', currentLocale);
  console.log('  - pathname:', pathname);
  console.log('  - isPending:', isPending);
  console.log('  - isOpen:', isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced handle locale change with language detection integration
  const handleLocaleChange = (newLocale: string) => {
    console.log('🔄 DEBUG - Language change initiated:');
    console.log('  - from:', currentLocale);
    console.log('  - to:', newLocale);
    
    setIsOpen(false);
    
    if (newLocale === currentLocale) {
      console.log('🔄 DEBUG - Same locale selected, no change needed');
      return;
    }

    // Update language preference using our language detection utility
    changeLanguage(newLocale as SupportedLocale);
    
    // Store language preference in cookie as well (for server-side rendering)
    try {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Strict`;
      console.log('🍪 DEBUG - Cookie set successfully:', `NEXT_LOCALE=${newLocale}`);
    } catch (error) {
      console.error('🍪 ERROR - Failed to set cookie:', error);
    }
    
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      
      console.log('🔄 DEBUG - Redirecting:');
      console.log('  - pathWithoutLocale:', pathWithoutLocale);
      console.log('  - newPath:', newPath);
      
      router.push(newPath);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 ${
          isPending ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 min-w-[24px]">
          {isPending ? '...' : localeNames[currentLocale]?.flag || '🌍'}
        </span>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {localeNames[currentLocale]?.name || 'Language'}
        </span>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            🌍 Dil Seçin / Select Language
          </div>
          
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            
            return (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                disabled={isPending || isActive}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="menuitem"
              >
                <span className="text-lg leading-none">
                  {localeNames[locale]?.flag || '🌍'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-900'}`}>
                      {localeNames[locale]?.name || locale.toUpperCase()}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    {locale.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
          
          <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 mt-1">
            🔧 Tercihiniz hatırlanacak / Your preference will be remembered
          </div>
        </div>
      )}
    </div>
  );
} 