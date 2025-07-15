'use client';

// Desteklenen diller - 5 dil tam destek (AR, JA, KO kaldırıldı)
export const supportedLocales = ['tr', 'en', 'es', 'fr', 'de'] as const;
export type SupportedLocale = typeof supportedLocales[number];

// Varsayılan dil
export const defaultLocale: SupportedLocale = 'tr';

// Browser dil mapping - browser dillerini desteklenen dillere map etme
const languageMapping: Record<string, SupportedLocale> = {
  // Turkish
  'tr': 'tr',
  'tr-TR': 'tr',
  
  // English
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  'en-IN': 'en',
  'en-NZ': 'en',
  'en-ZA': 'en',
  
  // Spanish
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  'es-PE': 'es',
  'es-VE': 'es',
  'es-EC': 'es',
  'es-GT': 'es',
  'es-CU': 'es',
  'es-BO': 'es',
  'es-DO': 'es',
  'es-HN': 'es',
  'es-NI': 'es',
  'es-PA': 'es',
  'es-PY': 'es',
  'es-SV': 'es',
  'es-UY': 'es',
  'es-PR': 'es',
  
  // French
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'fr-LU': 'fr',
  'fr-MC': 'fr',
  'fr-MA': 'fr',
  'fr-TN': 'fr',
  'fr-DZ': 'fr',
  'fr-SN': 'fr',
  'fr-CM': 'fr',
  'fr-CI': 'fr',
  'fr-BF': 'fr',
  'fr-NE': 'fr',
  'fr-ML': 'fr',
  'fr-MG': 'fr',
  'fr-MU': 'fr',
  'fr-SC': 'fr',
  'fr-RE': 'fr',
  'fr-YT': 'fr',
  'fr-GP': 'fr',
  'fr-MQ': 'fr',
  'fr-GF': 'fr',
  'fr-NC': 'fr',
  'fr-PF': 'fr',
  'fr-WF': 'fr',
  'fr-PM': 'fr',
  
  // German
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'de-LU': 'de',
  'de-LI': 'de',
  'de-BE': 'de'
};

// Dil isimlerini map etme
export const languageNames: Record<SupportedLocale, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

// Dil flag emoji'leri
export const languageFlags: Record<SupportedLocale, string> = {
  tr: '🇹🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪'
};

// Gelişmiş browser dil algılama fonksiyonu
export function detectBrowserLanguage(): SupportedLocale {
  console.log('🌍 Language Detection Started');
  
  if (typeof window === 'undefined') {
    console.log('🌍 Server-side rendering detected, using default locale:', defaultLocale);
    return defaultLocale;
  }

  // Browser dillerini al
  const browserLanguages: string[] = [];
  
  // navigator.languages (modern browsers)
  if (navigator.languages && navigator.languages.length > 0) {
    browserLanguages.push(...navigator.languages);
    console.log('🌍 navigator.languages found:', navigator.languages);
  }
  
  // navigator.language (fallback)
  if (navigator.language) {
    browserLanguages.push(navigator.language);
    console.log('🌍 navigator.language found:', navigator.language);
  }
  
  // navigator.userLanguage (IE fallback)
  if ((navigator as any).userLanguage) {
    browserLanguages.push((navigator as any).userLanguage);
    console.log('🌍 navigator.userLanguage found:', (navigator as any).userLanguage);
  }

  console.log('🌍 All detected browser languages:', browserLanguages);
  console.log('🌍 Supported locales:', supportedLocales);

  // Her browser dili için mapping kontrol et
  for (const browserLang of browserLanguages) {
    const normalizedLang = browserLang.toLowerCase();
    
    // Tam eşleşme kontrol et
    if (languageMapping[normalizedLang]) {
      const mappedLocale = languageMapping[normalizedLang];
      console.log(`🌍 Exact match found: ${browserLang} → ${mappedLocale}`);
      return mappedLocale;
    }
    
    // Kısmi eşleşme kontrol et (örn: "en-GB" → "en")
    const langCode = normalizedLang.split('-')[0];
    if (languageMapping[langCode]) {
      const mappedLocale = languageMapping[langCode];
      console.log(`🌍 Partial match found: ${browserLang} (${langCode}) → ${mappedLocale}`);
      return mappedLocale;
    }
    
    console.log(`🌍 No match for language: ${browserLang}`);
  }

  console.log('🌍 No matching language found, using default:', defaultLocale);
  return defaultLocale;
}

// URL'den locale alma
export function getLocaleFromUrl(pathname: string): SupportedLocale | null {
  console.log('🔗 Getting locale from URL:', pathname);
  
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    console.log('🔗 No segments found in URL');
    return null;
  }
  
  const potentialLocale = segments[0] as SupportedLocale;
  
  if (supportedLocales.includes(potentialLocale)) {
    console.log('🔗 Valid locale found in URL:', potentialLocale);
    return potentialLocale;
  }
  
  console.log('🔗 No valid locale found in URL');
  return null;
}

// Locale belirleme ana fonksiyonu
export function determineLocale(pathname: string): SupportedLocale {
  console.log('🎯 Determining locale for pathname:', pathname);
  
  // 1. URL'den locale kontrol et
  const urlLocale = getLocaleFromUrl(pathname);
  if (urlLocale) {
    console.log('🎯 Using locale from URL:', urlLocale);
    return urlLocale;
  }
  
  // 2. Browser dilini algıla
  const browserLocale = detectBrowserLanguage();
  console.log('🎯 Using browser-detected locale:', browserLocale);
  
  return browserLocale;
}

// Locale doğrulama
export function isValidLocale(locale: string): locale is SupportedLocale {
  const isValid = supportedLocales.includes(locale as SupportedLocale);
  console.log(`✅ Locale validation for "${locale}":`, isValid);
  return isValid;
}

// Locale normalizasyonu
export function normalizeLocale(locale: string): SupportedLocale {
  console.log('🔧 Normalizing locale:', locale);
  
  if (isValidLocale(locale)) {
    console.log('🔧 Locale is already valid:', locale);
    return locale;
  }
  
  // Language mapping kullanarak normalize et
  const normalizedLang = locale.toLowerCase();
  if (languageMapping[normalizedLang]) {
    const mapped = languageMapping[normalizedLang];
    console.log(`🔧 Mapped locale: ${locale} → ${mapped}`);
    return mapped;
  }
  
  // Kısmi eşleşme dene
  const langCode = normalizedLang.split('-')[0];
  if (languageMapping[langCode]) {
    const mapped = languageMapping[langCode];
    console.log(`🔧 Partial mapped locale: ${locale} (${langCode}) → ${mapped}`);
    return mapped;
  }
  
  console.log('🔧 No mapping found, using default:', defaultLocale);
  return defaultLocale;
}

// Gelişmiş dil algılama ve log sistemi
export function getOptimalLocale(): SupportedLocale {
  console.log('🚀 Starting optimal locale detection');
  
  if (typeof window === 'undefined') {
    console.log('🚀 Server-side: returning default locale:', defaultLocale);
    return defaultLocale;
  }
  
  // URL'den locale al
  const currentPath = window.location.pathname;
  const urlLocale = getLocaleFromUrl(currentPath);
  
  if (urlLocale) {
    console.log('🚀 Found locale in URL, using:', urlLocale);
    return urlLocale;
  }
  
  // Browser dilini algıla
  const browserLocale = detectBrowserLanguage();
  console.log('🚀 No URL locale, using browser locale:', browserLocale);
  
  // User preference'ı kontrol et (localStorage)
  try {
    const savedLocale = localStorage.getItem('preferred-locale');
    if (savedLocale && isValidLocale(savedLocale)) {
      console.log('🚀 Found saved user preference:', savedLocale);
      return savedLocale as SupportedLocale;
    }
  } catch (error) {
    console.log('🚀 Error reading localStorage:', error);
  }
  
  return browserLocale;
}

// Locale kaydetme
export function saveLocalePreference(locale: SupportedLocale): void {
  console.log('💾 Saving locale preference:', locale);
  
  if (typeof window === 'undefined') {
    console.log('💾 Server-side: cannot save to localStorage');
    return;
  }
  
  try {
    localStorage.setItem('preferred-locale', locale);
    console.log('💾 Locale preference saved successfully');
  } catch (error) {
    console.error('💾 Error saving locale preference:', error);
  }
} 

export const logLanguageDetection = (info: any) => {
  console.log('🌍 Language Detection Log:', info);
}

/**
 * URL path'inde locale olup olmadığını kontrol eder
 */
export const hasLocaleInPath = (path: string): boolean => {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  
  const firstSegment = segments[0];
  return supportedLocales.includes(firstSegment as SupportedLocale);
};

/**
 * URL path'inden locale'i çıkarır
 */
export const getLocaleFromPath = (path: string): SupportedLocale | null => {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  
  const firstSegment = segments[0];
  return supportedLocales.includes(firstSegment as SupportedLocale) 
    ? firstSegment as SupportedLocale 
    : null;
};

/**
 * Path'e locale ekler
 */
export const addLocaleToPath = (path: string, locale: SupportedLocale): string => {
  if (hasLocaleInPath(path)) {
    // Path'de zaten locale varsa, replace et
    const segments = path.split('/').filter(Boolean);
    segments[0] = locale;
    return '/' + segments.join('/');
  }
  
  // Path'de locale yoksa, başına ekle
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `/${locale}${cleanPath}`;
};

/**
 * Debug bilgilerini log'lar
 */
export const debugLanguageInfo = (locale: string, path: string) => {
  console.log('🔍 Language Debug Info:', {
    locale,
    path,
    hasLocaleInPath: hasLocaleInPath(path),
    supportedLocales,
    browserLanguage: typeof window !== 'undefined' ? navigator.language : 'unknown'
  });
};

/**
 * Dil değişikliği işlemini handle eder
 */
export const changeLanguage = (newLocale: SupportedLocale, currentPath: string): string => {
  // Yeni path'i oluştur
  const newPath = addLocaleToPath(currentPath, newLocale);
  
  // Cookie'ye kaydet
  if (typeof window !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`;
  }
  
  return newPath;
};

/**
 * Dil algılama ana fonksiyonu
 */
export const handleLanguageDetection = (currentPath: string): {
  detectedLocale: SupportedLocale;
  shouldRedirect: boolean;
  redirectPath?: string;
} => {
  // Path'de locale var mı kontrol et
  const localeInPath = getLocaleFromPath(currentPath);
  
  if (localeInPath) {
    return {
      detectedLocale: localeInPath,
      shouldRedirect: false
    };
  }
  
  // Browser dilini algıla
  const detectedLocale = detectBrowserLanguage();
  const redirectPath = addLocaleToPath(currentPath, detectedLocale);
  
  return {
    detectedLocale,
    shouldRedirect: true,
    redirectPath
  };
}; 