'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import Header from '@/components/Header';
import Link from 'next/link';
import { TrashIcon, XMarkIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { formatUSDPrice, getPricing } from '@/lib/pricingUtils';
import Image from 'next/image';

export default function CartPage() {
  const { items, totalPrice, removeItem, clearCart, hasMonthlyItems, applySpecialOffer } = useCart();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSpecialOffer, setShowSpecialOffer] = useState(false);
  const [specialOfferShown, setSpecialOfferShown] = useState(false);

  // 3 saniye sonra aylık plan varsa özel teklif göster
  useEffect(() => {
    if (hasMonthlyItems() && !specialOfferShown && items.length > 0) {
      const timer = setTimeout(() => {
        setShowSpecialOffer(true);
        setSpecialOfferShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasMonthlyItems, specialOfferShown, items.length]);

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Checkout logic burada olacak
    console.log('Proceeding to checkout with items:', items);
    // İyzico payment integration burada olacak
  };

  const handleSpecialOfferAccept = () => {
    const pricing = getPricing();
    
    // Aylık item'ları bul ve yıllık + %10 ekstra indirim uygula
    items.forEach(item => {
      if (item.period === 'monthly') {
        const planType = item.name.toLowerCase().includes('premium') ? 'premium' : 'business';
        const baseAnnualPrice = pricing[planType].annual;
        
        applySpecialOffer(item.id, baseAnnualPrice);
      }
    });
    
    setShowSpecialOffer(false);
  };

  const handleSpecialOfferDecline = () => {
    setShowSpecialOffer(false);
  };

  const getSpecialOfferSavings = () => {
    const pricing = getPricing();
    let totalSavings = 0;
    
    items.forEach(item => {
      if (item.period === 'monthly') {
        const planType = item.name.toLowerCase().includes('premium') ? 'premium' : 'business';
        const baseAnnualPrice = pricing[planType].annual;
        const specialPrice = baseAnnualPrice * 0.9; // %10 ekstra indirim
        const monthlySavings = (item.price * 12) - specialPrice;
        totalSavings += monthlySavings;
      }
    });
    
    return totalSavings;
  };



  if (items.length === 0) {
    return (
      <>
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center py-16 px-8">
            <div className="relative mb-8">
              <div className="text-8xl mb-4 animate-bounce">🛒</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">0</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-700 mb-8 text-lg max-w-md mx-auto">
              Henüz sepetinizde ürün bulunmuyor. Hemen planlarımızı keşfedin ve dijital dönüşüm yolculuğunuzu başlatın!
            </p>
            <Link 
              href="/pricing" 
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Planları İncele
            </Link>
          </div>
        </div>
        
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🛒 Sepetiniz
            </h1>
            <p className="text-gray-700 text-lg">
              Seçtiğiniz planlarınızı gözden geçirin ve ödeme adımına geçin
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-2xl font-bold text-gray-900 mr-3">{item.name}</h3>
                          {item.period === 'annual' && (
                            <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              🎯 Yıllık Plan
                            </span>
                          )}
                          {item.period === 'monthly' && (
                            <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              📅 Aylık Plan
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-lg">{item.description}</p>
                        {item.specialOffer && (
                          <div className="flex items-center mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <SparklesIcon className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-yellow-800 font-semibold">Özel Teklif Uygulandı!</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-full transition-all duration-200"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </div>
                    
                    {/* Pricing Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatUSDPrice(item.price)}
                          </div>
                          <div className="text-gray-800 font-medium">
                            {item.period === 'monthly' ? (
                              <span>💳 Aylık ödeme • {formatUSDPrice(item.price * 12)} yıllık toplam</span>
                            ) : (
                              <span>🎯 Tek seferlik yıllık ödeme</span>
                            )}
                          </div>
                        </div>
                        {item.period === 'annual' && (
                          <div className="text-right">
                            <div className="text-green-600 font-bold text-lg">
                              %{Math.round(((13.1 - item.price) / 13.1) * 100)} Tasarruf!
                            </div>
                            <div className="text-gray-700 text-sm">
                              Aylık yerine yıllık
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Offer Savings */}
                    {item.specialOffer && item.baseAnnualPrice && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                        <div className="text-green-800">
                          <div className="flex items-center mb-3">
                            <SparklesIcon className="w-6 h-6 text-green-600 mr-2" />
                            <span className="font-bold text-lg">🎉 Size Özel İndirim!</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Normal Yıllık Fiyat:</span>
                              <span className="line-through text-gray-800">{formatUSDPrice(item.baseAnnualPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sizin Özel Fiyatınız:</span>
                              <span className="font-bold text-green-700">{formatUSDPrice(item.price)}</span>
                            </div>
                            <div className="flex justify-between border-t border-green-200 pt-2">
                              <span className="font-bold">Toplam Tasarruf:</span>
                              <span className="font-bold text-green-700">
                                %{Math.round(((item.baseAnnualPrice - item.price) / item.baseAnnualPrice) * 100)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-800">
                          <span className="text-green-500 mr-3 text-lg">✓</span>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full bg-gradient-to-r from-red-50 to-pink-50 text-red-700 py-4 rounded-xl font-semibold hover:from-red-100 hover:to-pink-100 transition-all duration-300 border border-red-200"
              >
                🗑️ Sepeti Temizle
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">💼 Sipariş Özeti</h3>
                
                <div className="space-y-4 mb-8">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <div className="text-gray-900 font-semibold">{item.name}</div>
                        <div className="text-gray-700 text-sm">
                          {item.period === 'monthly' ? 'Aylık Plan' : 'Yıllık Plan'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatUSDPrice(item.price)}</div>
                        {item.period === 'monthly' && (
                          <div className="text-gray-700 text-xs">
                            {formatUSDPrice(item.price * 12)} / yıl
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800 font-semibold">Ara Toplam:</span>
                    <span className="text-gray-900 font-semibold">{formatUSDPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-800">Vergi:</span>
                    <span className="text-gray-900">Dahil</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-4">
                    <span className="text-gray-900">Toplam:</span>
                    <span className="text-blue-600">{formatUSDPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <div className="text-green-800 font-semibold">SSL Güvenli Ödeme</div>
                    <div className="text-green-700 text-sm">256-bit şifreleme</div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h4 className="text-gray-900 font-semibold mb-4">💳 Güvenli Ödeme Yöntemleri</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <Image src="/images/payment-methods/visa.svg" alt="Visa" width={50} height={32} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <Image src="/images/payment-methods/mastercard.svg" alt="MasterCard" width={50} height={32} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <Image src="/images/payment-methods/iyzico.svg" alt="İyzico" width={50} height={32} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {user ? '🚀 Ödemeye Geç' : '🔐 Giriş Yap ve Öde'}
                </button>
                
                <p className="text-gray-700 text-center text-sm mt-4">
                  14 gün ücretsiz deneme • İstediğiniz zaman iptal edin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offer Modal */}
      {showSpecialOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full animate-bounce-in shadow-2xl">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Size Özel Teklif!
              </h2>
              <p className="text-gray-800 mb-8 text-lg leading-relaxed">
                Aylık planınızı yıllık plana çevirmeniz için size özel 
                <span className="font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg mx-1">
                  %10 ekstra indirim
                </span> 
                sunuyoruz!
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                <div className="text-green-800">
                  <div className="text-2xl font-bold mb-4">
                    💰 {formatUSDPrice(getSpecialOfferSavings())} Tasarruf!
                  </div>
                  <div className="space-y-2 text-lg">
                    <div>✅ Normal yıllık indirim</div>
                    <div className="font-bold">✨ + Size özel %10 ekstra indirim</div>
                    <div>🎯 12 ay yerine tek seferde ödeme</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSpecialOfferDecline}
                  className="flex-1 bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hayır, Teşekkürler
                </button>
                <button
                  onClick={handleSpecialOfferAccept}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-colors shadow-lg"
                >
                  Kabul Ediyorum! 🎯
                </button>
              </div>
              
              <p className="text-gray-700 mt-6 text-sm">
                ⏰ Bu teklif sadece sizin için geçerlidir ve bir kez kullanılabilir.
              </p>
            </div>
            
            <button
              onClick={handleSpecialOfferDecline}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
} 