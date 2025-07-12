'use client';

// Desteklenen diller
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
  
  // Spanish
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  
  // French
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  
  // German
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de'
};

/**
 * Browser'ın dilini algılar ve desteklenen dile map eder
 * @returns Desteklenen locale
 */
export function detectBrowserLanguage(): SupportedLocale {
  // Server-side rendering kontrolü
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  try {
    // Navigator languages dizisini kontrol et (daha güvenilir)
    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const mappedLocale = languageMapping[lang.toLowerCase()];
        if (mappedLocale) {
          console.log('🌍 DEBUG - Browser Language Detected (languages):', lang, '→', mappedLocale);
          return mappedLocale;
        }
        
        // Dil kodu prefix kontrolü (örn: "en-US" → "en")
        const langPrefix = lang.split('-')[0].toLowerCase();
        const prefixMappedLocale = languageMapping[langPrefix];
        if (prefixMappedLocale) {
          console.log('🌍 DEBUG - Browser Language Detected (prefix):', langPrefix, '→', prefixMappedLocale);
          return prefixMappedLocale;
        }
      }
    }

    // Fallback: navigator.language
    if (navigator.language) {
      const lang = navigator.language.toLowerCase();
      const mappedLocale = languageMapping[lang];
      if (mappedLocale) {
        console.log('🌍 DEBUG - Browser Language Detected (language):', lang, '→', mappedLocale);
        return mappedLocale;
      }
      
      // Dil kodu prefix kontrolü
      const langPrefix = lang.split('-')[0];
      const prefixMappedLocale = languageMapping[langPrefix];
      if (prefixMappedLocale) {
        console.log('🌍 DEBUG - Browser Language Detected (language prefix):', langPrefix, '→', prefixMappedLocale);
        return prefixMappedLocale;
      }
    }

    console.log('🌍 DEBUG - No browser language match found, using default:', defaultLocale);
    return defaultLocale;
  } catch (error) {
    console.error('🌍 ERROR - Language detection failed:', error);
    return defaultLocale;
  }
}

/**
 * Mevcut URL'den locale bilgisini çıkarır
 * @param pathname Current pathname
 * @returns Locale veya null
 */
export function getLocaleFromPath(pathname: string): SupportedLocale | null {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return null;
  }
  
  const firstSegment = segments[0];
  
  if (supportedLocales.includes(firstSegment as SupportedLocale)) {
    return firstSegment as SupportedLocale;
  }
  
  return null;
}

/**
 * URL'nin locale içerip içermediğini kontrol eder
 * @param pathname Current pathname
 * @returns Boolean
 */
export function hasLocaleInPath(pathname: string): boolean {
  return getLocaleFromPath(pathname) !== null;
}

/**
 * Locale bilgisi olmayan path'e locale ekler
 * @param pathname Path without locale
 * @param locale Target locale
 * @returns Path with locale
 */
export function addLocaleToPath(pathname: string, locale: SupportedLocale): string {
  // Root path kontrolü
  if (pathname === '/' || pathname === '') {
    return `/${locale}`;
  }
  
  // Slash ile başlamayan path'ler için
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  
  return `/${locale}${pathname}`;
}

/**
 * Browser language detection ve redirect logic
 * Bu fonksiyon client component'lerde kullanılır
 */
export function handleLanguageDetection(): SupportedLocale {
  // Local storage'da tercih edilen dil var mı kontrol et
  if (typeof window !== 'undefined') {
    try {
      const savedLocale = localStorage.getItem('preferredLocale') as SupportedLocale;
      if (savedLocale && supportedLocales.includes(savedLocale)) {
        console.log('🔧 DEBUG - Using saved locale from localStorage:', savedLocale);
        return savedLocale;
      }
    } catch (error) {
      console.error('🔧 ERROR - localStorage access failed:', error);
    }
  }
  
  // Browser dilini algıla
  const detectedLocale = detectBrowserLanguage();
  
  // Tercih edilen dili localStorage'a kaydet
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('preferredLocale', detectedLocale);
      console.log('🔧 DEBUG - Saved detected locale to localStorage:', detectedLocale);
    } catch (error) {
      console.error('🔧 ERROR - localStorage save failed:', error);
    }
  }
  
  return detectedLocale;
}

/**
 * Dil değiştirme fonksiyonu
 * @param newLocale Yeni dil
 */
export function changeLanguage(newLocale: SupportedLocale): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('preferredLocale', newLocale);
      console.log('🔄 DEBUG - Language changed to:', newLocale);
    } catch (error) {
      console.error('🔄 ERROR - Language change failed:', error);
    }
  }
}

/**
 * Debug fonksiyonu - language detection bilgilerini konsola yazdırır
 */
export function debugLanguageInfo(): void {
  if (typeof window === 'undefined') {
    console.log('🐛 DEBUG - Running on server, no browser language info available');
    return;
  }
  
  console.log('🐛 DEBUG - Language Detection Info:');
  console.log('  - navigator.language:', navigator.language);
  console.log('  - navigator.languages:', navigator.languages);
  console.log('  - Detected locale:', detectBrowserLanguage());
  
  try {
    const savedLocale = localStorage.getItem('preferredLocale');
    console.log('  - Saved locale:', savedLocale);
  } catch (error) {
    console.log('  - localStorage error:', error);
  }
} 