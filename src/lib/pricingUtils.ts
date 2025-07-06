// USD bazlı basit fiyatlandırma sistemi
// Sadece USD fiyatları, TL hesaplama yok

export interface USDPricing {
  monthly: number;
  annual: number; // Bu aylık eşdeğer fiyat (örnek: $10.1)
  annualTotal: number; // Bu gerçek yıllık toplam fiyat (örnek: $121.2)
}

export interface PlanPricing {
  premium: USDPricing;
  business: USDPricing;
}

// USD bazlı sabit fiyatlar
export const USD_PRICING: PlanPricing = {
  premium: {
    monthly: 13.1,        // Aylık $13.1
    annual: 10.1,         // Yıllık planda aylık eşdeğer $10.1
    annualTotal: 121.2    // Gerçek yıllık toplam $121.2 (10.1 x 12)
  },
  business: {
    monthly: 40.1,        // Aylık $40.1
    annual: 30.1,         // Yıllık planda aylık eşdeğer $30.1
    annualTotal: 361.2    // Gerçek yıllık toplam $361.2 (30.1 x 12)
  }
};

// Fiyat formatla (USD görüntüleme için)
export function formatUSDPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 1
  }).format(price);
}

// Yıllık plan için gerçek toplam fiyat al
export function getAnnualTotalPrice(planType: 'premium' | 'business'): number {
  return USD_PRICING[planType].annualTotal;
}

// Tasarruf hesaplama (aylık vs yıllık)
export function calculateSavings(monthlyPrice: number, annualTotalPrice: number): number {
  const monthlyYearlyTotal = monthlyPrice * 12;
  return monthlyYearlyTotal - annualTotalPrice;
}

// Yıllık tasarruf yüzdesi
export function calculateSavingsPercentage(monthlyPrice: number, annualTotalPrice: number): number {
  const savings = calculateSavings(monthlyPrice, annualTotalPrice);
  const monthlyYearlyTotal = monthlyPrice * 12;
  return Math.round((savings / monthlyYearlyTotal) * 100);
}

// Fiyat bilgilerini al (basit döndürme)
export function getPricing(): PlanPricing {
  return USD_PRICING;
} 