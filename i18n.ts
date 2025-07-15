import { getRequestConfig } from 'next-intl/server';

// Desteklenen diller (AR, JA, KO kaldırıldı)
export const locales = ['tr', 'en', 'es', 'fr', 'de'] as const;

export type Locale = (typeof locales)[number];

// Dil bilgileri ve flag emoji'leri
export const localeNames: Record<Locale, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
};

// Varsayılan dil
export const defaultLocale: Locale = 'tr';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale ve her zaman string garantisi
  const validLocale = (locale && locales.includes(locale as Locale)) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

// RTL languages
export const rtlLanguages = ['ar'];

// Language display names
export const languageNames = {
  tr: 'Türkçe',
  en: 'English', 
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
} as const;

// Language flags (emoji flags)
export const languageFlags = {
  tr: '🇹🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
} as const; 