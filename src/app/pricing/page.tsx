'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import Header from '@/components/Header';
import StructuredData from '@/components/StructuredData';
import { 
  getPricing, 
  formatUSDPrice, 
  calculateSavingsPercentage,
  type PlanPricing 
} from '@/lib/pricingUtils';
import Image from 'next/image';

export default function PricingPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pricing, setPricing] = useState<PlanPricing | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    // USD fiyatlarını al
    const usdPricing = getPricing();
    setPricing(usdPricing);
  }, []);

  const handleSubscribe = (plan: 'free' | 'premium' | 'business', period?: 'monthly' | 'annual') => {
    if (plan === 'free') {
      // Free plan için direkt başla
      console.log('Starting with free plan');
      return;
    }
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Subscription logic burada olacak
    console.log(`Subscribing to ${plan} ${period || billingPeriod}`);
  };

  if (!pricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Fiyatlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StructuredData type="website" />
      
      {/* Header Navigation */}
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                💳 Fiyatlandırma Planları
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                Profesyonel dosya işleme araçlarına erişim. 
                Ücretsiz başlayın, ihtiyacınıza göre yükseltin.
              </p>
              
              {/* Billing Period Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <span className={`text-lg font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Aylık
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-lg font-medium ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yıllık
                </span>
                {billingPeriod === 'annual' && (
                  <div className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <span className="text-lg mr-1">💰</span>
                    %23&apos;e varan tasarruf!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ücretsiz</h3>
                <p className="text-gray-700">Başlamak için ideal</p>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-green-600">$0</span>
                  <span className="text-gray-600 ml-2">/her zaman</span>
                </div>
                <div className="text-sm text-gray-600">
                  Kalıcı olarak ücretsiz
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">5 PDF sıkıştırma/gün</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Temel format dönüştürme</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Dosya boyutu: 10MB&apos;a kadar</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">E-posta desteği</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Dosya geçmişi (7 gün)</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Ücretsiz Başla
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  ⭐ Önerilen
                </span>
              </div>

              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-700">Bireysel kullanıcılar için</p>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatUSDPrice(pricing.premium[billingPeriod])}
                  </span>
                  <span className="text-gray-600 ml-2">/{billingPeriod === 'monthly' ? 'ay' : 'yıl'}</span>
                </div>
                {billingPeriod === 'annual' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-lg font-bold text-green-700">
                      %{calculateSavingsPercentage(pricing.premium.monthly, pricing.premium.annual)} TASARRUF!
                    </div>
                    <div className="text-sm text-green-600">
                      Aylık: {formatUSDPrice(pricing.premium.monthly)} yerine
                    </div>
                  </div>
                )}
                {billingPeriod === 'monthly' && (
                  <div className="text-sm text-gray-600">
                    Yıllık öde, %{calculateSavingsPercentage(pricing.premium.monthly, pricing.premium.annual)} tasarruf et
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">Sınırsız PDF işlemleri</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Batch işleme (50 dosya)</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">5GB cloud storage</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Dosya boyutu: 100MB&apos;a kadar</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Öncelikli destek (24 saat)</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Gelişmiş filtreler ve ayarlar</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Dosya geçmişi (30 gün)</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium', billingPeriod)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Premium&apos;a Başla
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-700">Ekipler ve işletmeler için</p>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-purple-600">
                    {formatUSDPrice(pricing.business[billingPeriod])}
                  </span>
                  <span className="text-gray-600 ml-2">/{billingPeriod === 'monthly' ? 'ay' : 'yıl'}</span>
                </div>
                {billingPeriod === 'annual' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-lg font-bold text-green-700">
                      %{calculateSavingsPercentage(pricing.business.monthly, pricing.business.annual)} TASARRUF!
                    </div>
                    <div className="text-sm text-green-600">
                      Aylık: {formatUSDPrice(pricing.business.monthly)} yerine
                    </div>
                  </div>
                )}
                {billingPeriod === 'monthly' && (
                  <div className="text-sm text-gray-600">
                    Yıllık öde, %{calculateSavingsPercentage(pricing.business.monthly, pricing.business.annual)} tasarruf et
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">Premium&apos;daki tüm özellikler</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Batch işleme (200 dosya)</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">50GB cloud storage</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Dosya boyutu: 500MB&apos;a kadar</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">API erişimi ve webhook&apos;lar</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">24/7 premium destek</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Takım yönetimi ve analitik</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">Özel branding ve özelleştirme</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('business', billingPeriod)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
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
              <p className="text-center text-gray-700 mb-8">
                İyzico güvencesi ile güvenli ödeme. SSL şifrelemesi ve 3D Secure koruması.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-6">
                {/* Visa */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <Image 
                    src="/images/payment-methods/visa.png" 
                    alt="Visa"
                    width={120}
                    height={38}
                    className="h-9 w-auto"
                  />
                </div>

                {/* Mastercard */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <Image 
                    src="/images/payment-methods/mastercard.svg" 
                    alt="MasterCard"
                    width={120}
                    height={38}
                    className="h-9 w-auto"
                  />
                </div>

                {/* iyzico */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <Image 
                    src="/images/payment-methods/iyzico.svg" 
                    alt="İyzico ile Öde"
                    width={120}
                    height={38}
                    className="h-9 w-auto"
                  />
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
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
                <p className="text-gray-700">
                  USD bazlı sabit fiyatlarımız, döviz kurundaki dalgalanmalardan etkilenmez. 
                  Bu sayede şeffaf ve öngörülebilir bir fiyat yapısı sunuyoruz.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Hangi ödeme yöntemlerini kabul ediyorsunuz?
                </h3>
                <p className="text-gray-700">
                  Visa, Mastercard, American Express ve İyzico ile güvenli ödeme alabilirsiniz. 
                  Tüm ödemeler SSL şifrelemesi ile korunmaktadır.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  İptal politikanız nedir?
                </h3>
                <p className="text-gray-700">
                  İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. İptal sonrası mevcut 
                  periyodunuz sonuna kadar hizmetlere erişim devam eder.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ücretsiz plan ile neler yapabilirim?
                </h3>
                <p className="text-gray-700">
                  Ücretsiz planla günde 5 PDF sıkıştırma, temel format dönüştürme ve 10MB&apos;a 
                  kadar dosya işleme işlemlerini gerçekleştirebilirsiniz.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Planımı ne zaman değiştirebilirim?
                </h3>
                <p className="text-gray-700">
                  İstediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. 
                  Değişiklikler anında geçerli olur ve fatura döneminde eşit olarak hesaplanır.
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