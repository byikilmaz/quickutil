'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  getPricing, 
  formatPrice, 
  calculateSavings, 
  calculateSavingsPercentage,
  type CalculatedPricing 
} from '@/lib/pricingUtils';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pricing, setPricing] = useState<CalculatedPricing | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Pricing'i yükle
  useEffect(() => {
    const loadPricing = async () => {
      try {
        setIsLoadingPricing(true);
        const calculatedPricing = await getPricing();
        setPricing(calculatedPricing);
      } catch (error) {
        console.error('Pricing load error:', error);
        // Fallback pricing
        setPricing({
          premium: { monthly: 449, annual: 345 },
          business: { monthly: 1371, annual: 1031 },
          lastUpdated: new Date().toISOString(),
          exchangeRate: 34.2
        });
      } finally {
        setIsLoadingPricing(false);
      }
    };

    loadPricing();
  }, []);

  // Pricing yenile
  const refreshPricing = async () => {
    // Cache'i temizle ve yeniden yükle
    localStorage.removeItem('quickutil_pricing_cache');
    setIsLoadingPricing(true);
    const freshPricing = await getPricing();
    setPricing(freshPricing);
    setIsLoadingPricing(false);
  };

  const plans = [
    {
      id: 'basic',
      name: 'QuickUtil Basic',
      subtitle: 'Bireysel kullanıcılar için',
      price: { monthly: 0, annual: 0 },
      popular: false,
      color: 'from-gray-600 to-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900',
      features: [
        { name: '5 belge / ay', included: true, detail: 'PDF sıkıştırma, dönüştürme, e-imza' },
        { name: '3 alıcı / belge', included: true, detail: 'E-imza için email gönderimi' },
        { name: 'Temel dosya işleme', included: true, detail: 'PDF, resim dönüştürme' },
        { name: '30 gün belge saklama', included: true, detail: 'Firebase Storage' },
        { name: 'Email destek', included: true, detail: '48 saat yanıt süresi' },
        { name: 'Mobil uyumlu', included: true, detail: 'Tüm cihazlarda çalışır' },
        { name: 'Gelişmiş imza türleri', included: false },
        { name: 'Belge şablonları', included: false },
        { name: 'API erişimi', included: false },
        { name: 'Öncelik desteği', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Profesyonel kullanıcılar için',
      price: pricing ? { 
        monthly: pricing.premium.monthly, 
        annual: pricing.premium.annual 
      } : { monthly: 0, annual: 0 },
      popular: true,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      features: [
        { name: 'Sınırsız belge', included: true, detail: 'Aylık limit yok' },
        { name: 'Sınırsız alıcı', included: true, detail: 'İstediğiniz kadar email gönderimi' },
        { name: 'Gelişmiş imza türleri', included: true, detail: 'Çizim, yazı, yükleme' },
        { name: '1 yıl belge saklama', included: true, detail: 'Uzun süreli arşiv' },
        { name: 'Belge şablonları', included: true, detail: 'Hazır imza şablonları' },
        { name: 'Toplu işlem', included: true, detail: 'Birden fazla PDF işleme' },
        { name: 'Öncelik email desteği', included: true, detail: '12 saat yanıt süresi' },
        { name: 'Gelişmiş analitik', included: true, detail: 'Detaylı kullanım istatistikleri' },
        { name: 'Özel marka', included: false },
        { name: 'API erişimi', included: false }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Ekipler ve şirketler için',
      price: pricing ? { 
        monthly: pricing.business.monthly, 
        annual: pricing.business.annual 
      } : { monthly: 0, annual: 0 },
      popular: false,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-900',
      features: [
        { name: 'Premium\'un tüm özellikleri', included: true, detail: 'Sınırsız kullanım' },
        { name: 'Takım işbirliği', included: true, detail: 'Çoklu kullanıcı yönetimi' },
        { name: 'API erişimi', included: true, detail: 'Kendi uygulamanızla entegrasyon' },
        { name: 'Özel marka', included: true, detail: 'Logonuzla email gönderimi' },
        { name: 'Öncelik telefon desteği', included: true, detail: '6 saat yanıt süresi' },
        { name: 'Özel entegrasyonlar', included: true, detail: 'Webhook, SSO' },
        { name: 'Gelişmiş güvenlik', included: true, detail: 'Enterprise-grade security' },
        { name: 'SLA garantisi', included: true, detail: '%99.9 uptime garantisi' },
        { name: 'Dedicated hesap yöneticisi', included: true, detail: 'Kişisel destek' },
        { name: 'Özel eğitim', included: true, detail: 'Takım eğitimi' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'QuickUtil Basic gerçekten ücretsiz mi?',
      answer: 'Evet! Ayda 5 belgeye kadar tamamen ücretsiz kullanabilirsiniz. Kredi kartı bilgisi gerektirmez.'
    },
    {
      question: 'Fiyatlar USD bazlı nasıl hesaplanıyor?',
      answer: 'Fiyatlarımız USD bazında belirlenir ve güncel döviz kuruna göre TL karşılığı hesaplanır. Fiyatlar her ayın sonunda güncellenir.'
    },
    {
      question: 'Yıllık ödeme ile ne kadar tasarruf ederim?',
      answer: pricing ? `Premium için yıllık ödeme ile aylık %${calculateSavingsPercentage(pricing.premium.monthly, pricing.premium.annual)}, Business için %${calculateSavingsPercentage(pricing.business.monthly, pricing.business.annual)} tasarruf edersiniz.` : 'Yıllık ödeme ile %20-25 arası tasarruf edersiniz.'
    },
    {
      question: 'Planımı istediğim zaman değiştirebilir miyim?',
      answer: 'Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklik hemen etkili olur.'
    },
    {
      question: 'Belge sınırını aştığımda ne olur?',
      answer: 'Basic planda limit aştığınızda Premium\'a yükseltme önerisi gösterilir. Premium ve Business\'ta sınır yoktur.'
    },
    {
      question: 'İptal ettiğimde verilerim ne olur?',
      answer: 'İptal ettiğinizde 30 gün boyunca verilerinize erişebilirsiniz. Sonrasında güvenle silinir.'
    },
    {
      question: 'API erişimi nasıl çalışır?',
      answer: 'Business planında REST API ile kendi uygulamanızdan QuickUtil özelliklerini kullanabilirsiniz.'
    }
  ];

  const stats = [
    { label: 'Aktif Kullanıcı', value: '10,000+', icon: UserGroupIcon },
    { label: 'İşlenen Belge', value: '500K+', icon: SparklesIcon },
    { label: 'Müşteri Memnuniyeti', value: '%98', icon: StarIcon },
    { label: 'Uptime Garantisi', value: '%99.9', icon: BuildingOfficeIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      <Breadcrumb />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 text-white mb-6 shadow-lg">
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Basit ve Şeffaf 
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fiyatlandırma
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            İhtiyacınıza uygun planı seçin. İlk ay ücretsiz deneyin, istediğiniz zaman iptal edin. 
            Gizli ücret yok, taahhüt yok.
          </p>

          {/* Fiyat yenileme ve debug panel */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={refreshPricing}
              disabled={isLoadingPricing}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoadingPricing ? 'animate-spin' : ''}`} />
              Fiyatları Yenile
            </button>
            
            {pricing && (
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Fiyat Detayları
              </button>
            )}
          </div>

          {/* Debug Panel */}
          {showDebugPanel && pricing && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Fiyatlandırma Debug Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">USD Bazlı Fiyatlar:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Premium Aylık: 13.1 USD</div>
                    <div>Premium Yıllık: 10.1 USD</div>
                    <div>Business Aylık: 40.1 USD</div>
                    <div>Business Yıllık: 30.1 USD</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">TL Karşılıkları:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Döviz Kuru: {pricing.exchangeRate} TL/USD</div>
                    <div>Premium Aylık: {formatPrice(pricing.premium.monthly)}</div>
                    <div>Premium Yıllık: {formatPrice(pricing.premium.annual)}</div>
                    <div>Business Aylık: {formatPrice(pricing.business.monthly)}</div>
                    <div>Business Yıllık: {formatPrice(pricing.business.annual)}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Son güncelleme: {new Date(pricing.lastUpdated).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Aylık
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Yıllık
            </span>
            {isAnnual && pricing && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                %{Math.max(
                  calculateSavingsPercentage(pricing.premium.monthly, pricing.premium.annual),
                  calculateSavingsPercentage(pricing.business.monthly, pricing.business.annual)
                )}&apos;e varan tasarruf
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const currentPrice = plan.price[isAnnual ? 'annual' : 'monthly'];
            const otherPrice = plan.price[isAnnual ? 'monthly' : 'annual'];
            const hasSavings = isAnnual && currentPrice > 0 && otherPrice > 0 && otherPrice > currentPrice;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : 'hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                      <StarIcon className="w-4 h-4 mr-1" />
                      En Popüler
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.subtitle}</p>
                  
                  <div className="mb-6">
                    {isLoadingPricing && plan.id !== 'basic' ? (
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <span className="text-5xl font-bold text-gray-900">
                        {currentPrice === 0 ? 'Ücretsiz' : formatPrice(currentPrice)}
                      </span>
                    )}
                    {currentPrice > 0 && (
                      <span className="text-gray-600 ml-1">
                        /ay
                      </span>
                    )}
                  </div>
                  
                  {hasSavings && (
                    <p className="text-sm text-green-600 mb-6">
                      Yıllık ödeme ile {formatPrice(calculateSavings(otherPrice, currentPrice))}/ay tasarruf
                    </p>
                  )}
                  
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        : plan.id === 'basic'
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                    }`}
                  >
                    {plan.id === 'basic' ? 'Ücretsiz Başla' : 'Ücretsiz Dene'}
                    <ArrowRightIcon className="inline w-4 h-4 ml-2" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        {feature.included ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-gray-300 mt-0.5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          feature.included ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {feature.name}
                        </p>
                        {feature.detail && feature.included && (
                          <p className="text-xs text-gray-500 mt-1">
                            {feature.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Binlerce kullanıcının güvendiği platform
            </h2>
            <p className="text-lg text-gray-600">
              QuickUtil ile dosya işleme süreçlerinizi hızlandırın
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sık Sorulan Sorular
            </h2>
            <p className="text-lg text-gray-600">
              Fiyatlandırma ile ilgili merak ettikleriniz
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hemen başlamaya hazır mısınız?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Ücretsiz hesap oluşturun ve tüm özelliklerimizi keşfedin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pdf-compress"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ücretsiz Başla
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              Demo İzle
            </button>
          </div>
        </div>
      </div>
      
      {/* Auth Modal Placeholder */}
      {showAuthModal && (
        <div>Auth Modal Placeholder</div>
      )}
    </div>
  );
} 