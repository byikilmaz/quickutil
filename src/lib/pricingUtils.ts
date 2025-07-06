// USD bazlı basit fiyatlandırma sistemi
// Sadece USD fiyatları, TL hesaplama yok

export interface USDPricing {
  monthly: number;
  annual: number;
}

export interface PlanPricing {
  premium: USDPricing;
  business: USDPricing;
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

// Fiyat formatla (USD görüntüleme için)
export function formatUSDPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 1
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

// Fiyat bilgilerini al (basit döndürme)
export function getPricing(): PlanPricing {
  return USD_PRICING;
} 