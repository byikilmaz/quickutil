'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import StructuredData from '@/components/StructuredData';
import { 
  getPricing, 
  formatUSDPrice, 
  calculateSavingsPercentage,
  type PlanPricing 
} from '@/lib/pricingUtils';

export default function PricingPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pricing, setPricing] = useState<PlanPricing | null>(null);

  useEffect(() => {
    // Basit USD fiyatlarını al
    const usdPricing = getPricing();
    setPricing(usdPricing);
  }, []);

  const handleSubscribe = (plan: 'premium' | 'business', period: 'monthly' | 'annual') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Subscription logic burada olacak
    console.log(`Subscribing to ${plan} ${period}`);
  };

  if (!pricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fiyatlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                💳 Fiyatlandırma Planları
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profesyonel dosya işleme araçlarına sınırsız erişim. 
                USD bazlı sabit fiyatlarla, şeffaf ve adil ödeme.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-blue-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-600">Bireysel kullanıcılar için</p>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatUSDPrice(pricing.premium.annual)}
                  </span>
                  <span className="text-gray-500 ml-2">/yıl</span>
                </div>
                <div className="text-sm text-gray-500">
                  Aylık: {formatUSDPrice(pricing.premium.monthly)} 
                  <span className="text-green-600 ml-2">
                    (%{calculateSavingsPercentage(pricing.premium.monthly, pricing.premium.annual)} tasarruf)
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sınırsız PDF sıkıştırma
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Batch işleme (50 dosyaya kadar)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5GB cloud storage
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Öncelikli destek
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium', 'annual')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Premium&apos;a Başla
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-purple-200">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  🚀 Popüler
                </span>
              </div>

              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-600">Ekipler ve işletmeler için</p>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-purple-600">
                    {formatUSDPrice(pricing.business.annual)}
                  </span>
                  <span className="text-gray-500 ml-2">/yıl</span>
                </div>
                <div className="text-sm text-gray-500">
                  Aylık: {formatUSDPrice(pricing.business.monthly)} 
                  <span className="text-green-600 ml-2">
                    (%{calculateSavingsPercentage(pricing.business.monthly, pricing.business.annual)} tasarruf)
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Premium&apos;daki tüm özellikler
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Batch işleme (200 dosyaya kadar)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  50GB cloud storage
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  API erişimi
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 premium destek
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('business', 'annual')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                Business&apos;a Başla
              </button>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                💳 Güvenli Ödeme Yöntemleri
              </h2>
              <p className="text-center text-gray-600 mb-8">
                İyzico güvencesi ile güvenli ödeme. SSL şifrelemesi ve 3D Secure koruması.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-6">
                {/* Visa */}
                <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <svg width="80" height="26" viewBox="0 0 80 26" fill="none">
                    <rect width="80" height="26" fill="white" rx="4"/>
                    <path d="M33.86 8.44L30.03 17.56H27.12L25.29 10.38C25.15 9.86 24.93 9.41 24.57 9.18C23.68 8.68 22.68 8.24 21.64 7.97L21.84 8.44H26.9C27.6 8.44 28.2 8.94 28.33 9.64L29.55 15.82L32.69 8.44H33.86ZM41.56 15.19C41.58 12.18 38.47 11.99 38.49 10.89C38.51 10.56 38.83 10.21 39.56 10.09C39.93 10.03 41.12 9.98 42.44 10.55L42.86 8.91C42.32 8.72 41.6 8.54 40.68 8.54C37.84 8.54 35.88 9.96 35.86 11.97C35.84 13.46 37.21 14.24 38.22 14.71C39.26 15.19 39.61 15.5 39.61 15.94C39.6 16.59 38.75 16.88 37.97 16.9C36.85 16.93 36.25 16.66 35.8 16.44L35.36 18.15C35.81 18.37 36.64 18.56 37.51 18.57C40.68 18.57 42.61 17.18 42.62 14.99C42.63 13.38 41.56 15.19 41.56 15.19ZM49.56 8.44L47.3 17.56H44.84L42.58 8.44H49.56ZM56.48 10.53C55.86 10.29 54.89 10.04 53.68 10.04C52.02 10.04 50.87 10.85 50.87 12.05C50.87 12.96 51.6 13.53 52.99 14.22C53.98 14.73 54.52 15.07 54.52 15.56C54.52 16.28 53.6 16.6 52.76 16.6C51.7 16.6 51.14 16.35 50.71 16.14L50.27 17.85C50.73 18.06 51.58 18.24 52.46 18.24C54.28 18.24 55.44 17.45 55.44 16.16C55.44 15.16 54.68 14.52 53.24 13.81C52.31 13.34 51.8 13.02 51.8 12.58C51.8 12.01 52.48 11.7 53.68 11.7C54.64 11.7 55.24 11.9 55.68 12.09L56.48 10.53Z" fill="#1434CB"/>
                  </svg>
                </div>

                {/* Mastercard */}
                <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <svg width="80" height="26" viewBox="0 0 80 26" fill="none">
                    <rect width="80" height="26" fill="white" rx="4"/>
                    <circle cx="29" cy="13" r="8" fill="#EB001B"/>
                    <circle cx="40" cy="13" r="8" fill="#F79E1B"/>
                    <path d="M34.5 8.5C36.6 10.2 38 12.4 38 15S36.6 19.8 34.5 21.5C32.4 19.8 31 17.6 31 15S32.4 10.2 34.5 8.5Z" fill="#FF5F00"/>
                  </svg>
                </div>

                {/* iyzico */}
                <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <svg width="80" height="26" viewBox="0 0 80 26" fill="none">
                    <rect width="80" height="26" fill="white" rx="4"/>
                    <path d="M12 8H18V18H12V8ZM22 13L28 8V10.5L24.5 13.5L28 16.5V19L22 15V13ZM30 8H60V10H32V12H58V14H32V16H60V18H30V8Z" fill="#1BB3E8"/>
                  </svg>
                </div>

                {/* PayPal */}
                <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <svg width="80" height="26" viewBox="0 0 80 26" fill="none">
                    <rect width="80" height="26" fill="white" rx="4"/>
                    <path d="M26 8C29.3 8 32 10.7 32 14S29.3 20 26 20H20L18 22H15L20 8H26ZM26 10H22.5L21 16H26C27.7 16 29 14.7 29 13S27.7 10 26 10Z" fill="#003087"/>
                    <path d="M34 10C37.3 10 40 12.7 40 16S37.3 22 34 22H28L27 24H24L28 10H34ZM34 12H30.5L29 18H34C35.7 18 37 16.7 37 15S35.7 12 34 12Z" fill="#009CDE"/>
                  </svg>
                </div>

                {/* SSL Certificate */}
                <div className="flex items-center bg-green-600 rounded-lg px-4 py-3 text-white shadow-sm hover:shadow-md transition-shadow">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">SSL Güvenli</span>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  256-bit SSL şifrelemesi • 3D Secure doğrulama • PCI DSS uyumluluğu
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Sık Sorulan Sorular
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Neden USD bazlı fiyatlandırma?
                </h3>
                <p className="text-gray-600">
                  USD bazlı sabit fiyatlarımız, döviz kurundaki dalgalanmalardan etkilenmez. 
                  Bu sayede şeffaf ve öngörülebilir bir fiyat yapısı sunuyoruz.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Hangi ödeme yöntemlerini kabul ediyorsunuz?
                </h3>
                <p className="text-gray-600">
                  Visa, Mastercard, American Express ve PayPal ile güvenli ödeme alabilirsiniz. 
                  Tüm ödemeler SSL şifrelemesi ile korunmaktadır.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  İptal politikanız nedir?
                </h3>
                <p className="text-gray-600">
                  İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. İptal sonrası mevcut 
                  periyodunuz sonuna kadar hizmetlere erişim devam eder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
} 