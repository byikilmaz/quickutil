// USD bazlı dinamik fiyatlandırma sistemi
// TL karşılık hesaplama bracket mantığı ile

export interface USDPricing {
  monthly: number;
  annual: number;
}

export interface PlanPricing {
  premium: USDPricing;
  business: USDPricing;
}

export interface TLPricing {
  monthly: number;
  annual: number;
}

export interface CalculatedPricing {
  premium: TLPricing;
  business: TLPricing;
  lastUpdated: string;
  exchangeRate: number;
}

// USD bazlı sabit fiyatlar
export const USD_PRICING: PlanPricing = {
  premium: {
    monthly: 13.1,  // USD
    annual: 10.1    // USD
  },
  business: {
    monthly: 40.1,  // USD
    annual: 30.1    // USD
  }
};

// TL bracket hesaplama fonksiyonu
export function calculateTLBracket(usdPrice: number, exchangeRate: number): number {
  const rawTLPrice = usdPrice * exchangeRate;
  
  // Bracket sistemi - 100'er TL aralıklarında
  if (rawTLPrice <= 400) {
    // 400 TL ve altı - gerçek kur
    return Math.round(rawTLPrice);
  } else {
    // 400 TL üzeri - bracket sistemi
    const bracket = Math.floor(rawTLPrice / 100) * 100;
    return bracket + 1; // 501, 601, 701, vb.
  }
}

// Döviz kuru alma fonksiyonu (mock - production'da gerçek API kullanılacak)
export async function fetchExchangeRate(): Promise<number> {
  try {
    // Production'da gerçek USD/TL kuru API'si kullanılacak
    // Şimdilik mock değer (güncel kura yakın)
    const mockRate = 34.2; // USD/TL
    
    // Gerçek implementasyon için:
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    // return data.rates.TRY;
    
    return mockRate;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    // Fallback değer
    return 34.0;
  }
}

// TL fiyatlarını hesaplama
export async function calculateTLPricing(): Promise<CalculatedPricing> {
  const exchangeRate = await fetchExchangeRate();
  
  const calculated: CalculatedPricing = {
    premium: {
      monthly: calculateTLBracket(USD_PRICING.premium.monthly, exchangeRate),
      annual: calculateTLBracket(USD_PRICING.premium.annual, exchangeRate)
    },
    business: {
      monthly: calculateTLBracket(USD_PRICING.business.monthly, exchangeRate),
      annual: calculateTLBracket(USD_PRICING.business.annual, exchangeRate)
    },
    lastUpdated: new Date().toISOString(),
    exchangeRate
  };
  
  return calculated;
}

// Local storage cache yönetimi
const PRICING_CACHE_KEY = 'quickutil_pricing_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

export function getCachedPricing(): CalculatedPricing | null {
  try {
    const cached = localStorage.getItem(PRICING_CACHE_KEY);
    if (!cached) return null;
    
    const pricing = JSON.parse(cached);
    const cacheTime = new Date(pricing.lastUpdated).getTime();
    const now = Date.now();
    
    // 24 saatten eski ise cache'i geçersiz say
    if (now - cacheTime > CACHE_DURATION) {
      localStorage.removeItem(PRICING_CACHE_KEY);
      return null;
    }
    
    return pricing;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export function setCachedPricing(pricing: CalculatedPricing): void {
  try {
    localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(pricing));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Ana fiyat alma fonksiyonu
export async function getPricing(): Promise<CalculatedPricing> {
  // Önce cache'e bak
  const cached = getCachedPricing();
  if (cached) {
    return cached;
  }
  
  // Cache yoksa yeni hesapla
  const pricing = await calculateTLPricing();
  setCachedPricing(pricing);
  
  return pricing;
}

// Fiyat formatla (görüntüleme için)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(price);
}

// Tasarruf hesaplama
export function calculateSavings(monthlyPrice: number, annualPrice: number): number {
  return monthlyPrice - annualPrice;
}

// Yıllık tasarruf yüzdesi
export function calculateSavingsPercentage(monthlyPrice: number, annualPrice: number): number {
  const savings = calculateSavings(monthlyPrice, annualPrice);
  return Math.round((savings / monthlyPrice) * 100);
}

// Debug bilgileri
export function getPricingDebugInfo(pricing: CalculatedPricing) {
  return {
    usdPricing: USD_PRICING,
    tlPricing: pricing,
    exchangeRate: pricing.exchangeRate,
    lastUpdated: new Date(pricing.lastUpdated).toLocaleString('tr-TR'),
    brackets: {
      premiumMonthly: `${USD_PRICING.premium.monthly} USD × ${pricing.exchangeRate} = ${(USD_PRICING.premium.monthly * pricing.exchangeRate).toFixed(2)} TL → ${pricing.premium.monthly} TL`,
      premiumAnnual: `${USD_PRICING.premium.annual} USD × ${pricing.exchangeRate} = ${(USD_PRICING.premium.annual * pricing.exchangeRate).toFixed(2)} TL → ${pricing.premium.annual} TL`,
      businessMonthly: `${USD_PRICING.business.monthly} USD × ${pricing.exchangeRate} = ${(USD_PRICING.business.monthly * pricing.exchangeRate).toFixed(2)} TL → ${pricing.business.monthly} TL`,
      businessAnnual: `${USD_PRICING.business.annual} USD × ${pricing.exchangeRate} = ${(USD_PRICING.business.annual * pricing.exchangeRate).toFixed(2)} TL → ${pricing.business.annual} TL`
    }
  };
} 