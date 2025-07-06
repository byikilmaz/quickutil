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