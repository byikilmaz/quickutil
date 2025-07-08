'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// Locale types and configuration
export type Locale = 'tr' | 'en' | 'es' | 'fr' | 'de' | 'ar' | 'ja' | 'ko';

export const locales: Locale[] = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' }
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
    return locales.includes(localeFromPath) ? localeFromPath : 'tr';
  };

  const currentLocale = getCurrentLocale();

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

  // Handle locale change
  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    
    if (newLocale === currentLocale) return;

    // Store language preference in cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Strict`;
    
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
      const newPath = `/${newLocale}${pathWithoutLocale}`;
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
            Select Language
          </div>
          
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            
            return (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                disabled={isPending || isActive}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="menuitem"
              >
                <span className="text-lg leading-none">
                  {localeNames[locale]?.flag || '🌍'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {localeNames[locale]?.name || locale.toUpperCase()}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
            Your preference will be remembered
          </div>
        </div>
      )}
    </div>
  );
} 