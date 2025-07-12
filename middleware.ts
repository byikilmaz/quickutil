import { NextRequest, NextResponse } from 'next/server';
import { supportedLocales, defaultLocale } from './src/lib/languageDetection';

// Browser dil mapping - server-side version
const languageMapping: Record<string, string> = {
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
 * Browser dilini algılar ve desteklenen dile map eder (server-side)
 */
function detectBrowserLanguageFromRequest(request: NextRequest): string {
  // Cookie'den tercih edilen dili kontrol et
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && supportedLocales.includes(cookieLocale as any)) {
    console.log('🍪 Middleware - Using locale from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Accept-Language header'ını kontrol et
  const acceptLanguage = request.headers.get('Accept-Language');
  
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,tr;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .filter(Boolean);

    // İlk match olan dili döndür
    for (const lang of languages) {
      const mappedLocale = languageMapping[lang];
      if (mappedLocale && supportedLocales.includes(mappedLocale as any)) {
        console.log('🌍 Middleware - Detected browser language:', lang, '→', mappedLocale);
        return mappedLocale;
      }
      
      // Dil prefix kontrolü (örn: "en-US" → "en")
      const langPrefix = lang.split('-')[0];
      const prefixMappedLocale = languageMapping[langPrefix];
      if (prefixMappedLocale && supportedLocales.includes(prefixMappedLocale as any)) {
        console.log('🌍 Middleware - Detected browser language (prefix):', langPrefix, '→', prefixMappedLocale);
        return prefixMappedLocale;
      }
    }
  }

  console.log('🌍 Middleware - No language match, using default:', defaultLocale);
  return defaultLocale;
}

/**
 * URL'den locale bilgisini çıkarır
 */
function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return null;
  }
  
  const firstSegment = segments[0];
  
  if (supportedLocales.includes(firstSegment as any)) {
    return firstSegment;
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🚀 Middleware - Processing request:', pathname);
  
  // Static dosyaları ve API route'larını es geç
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/js/') ||
    pathname.includes('.') // Dosya uzantıları (.css, .js, .png, vb.)
  ) {
    console.log('🚀 Middleware - Skipping static/API route:', pathname);
    return NextResponse.next();
  }

  // Mevcut locale'i kontrol et
  const localeInPath = getLocaleFromPathname(pathname);
  
  console.log('🚀 Middleware - Locale in path:', localeInPath);

  // Eğer URL'de geçerli bir locale yoksa, browser dilini algıla ve yönlendir
  if (!localeInPath) {
    const detectedLocale = detectBrowserLanguageFromRequest(request);
    const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
    
    console.log('🔄 Middleware - Redirecting to:', newUrl.pathname);
    
    // Tercih edilen dili cookie'ye kaydet
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
      httpOnly: false,
      sameSite: 'strict',
      path: '/'
    });
    
    return response;
  }

  // Geçerli locale varsa, işleme devam et
  console.log('🚀 Middleware - Valid locale found, continuing:', localeInPath);
  return NextResponse.next();
}

export const config = {
  // Tüm route'ları match et, ancak static dosyaları hariç tut
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - icons (public icons)
     * - js (public js files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|js|.*\\.).*)'
  ]
}; 