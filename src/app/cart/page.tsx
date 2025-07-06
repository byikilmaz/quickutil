'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import Header from '@/components/Header';
import Link from 'next/link';
import { TrashIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-6">Henüz sepetinizde ürün bulunmuyor.</p>
            <Link 
              href="/pricing" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
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
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🛒 Sepetiniz</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      {item.specialOffer && (
                        <div className="flex items-center mt-2">
                          <SparklesIcon className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-yellow-600 font-medium">Özel Teklif Uygulandı!</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatUSDPrice(item.price)}
                    </span>
                    <span className="text-gray-500">
                      /{item.period === 'monthly' ? 'ay' : 'yıl'}
                    </span>
                  </div>

                  {/* Savings Display */}
                  {item.specialOffer && item.baseAnnualPrice && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="text-sm text-green-700">
                        <span className="font-medium">🎉 Size Özel İndirim!</span>
                        <br />
                        Normal Yıllık: {formatUSDPrice(item.baseAnnualPrice)} → 
                        Sizin Fiyatınız: {formatUSDPrice(item.price)}
                        <br />
                        <span className="font-bold">%{Math.round(((item.baseAnnualPrice - item.price) / item.baseAnnualPrice) * 100)} tasarruf!</span>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Sepeti Temizle
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h3>
                
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium">{formatUSDPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-blue-600">{formatUSDPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Güvenli Ödeme</h4>
                  <div className="flex flex-wrap gap-2">
                    <Image src="/images/payment-methods/visa.png" alt="Visa" width={40} height={25} />
                    <Image src="/images/payment-methods/mastercard.svg" alt="MasterCard" width={40} height={25} />
                    <Image src="/images/payment-methods/iyzico.svg" alt="İyzico" width={40} height={25} />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {user ? 'Ödemeye Geç' : 'Giriş Yap ve Öde'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offer Modal */}
      {showSpecialOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-bounce-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Size Özel Teklif!
              </h2>
              <p className="text-gray-600 mb-6">
                Aylık planınızı yıllık plana çevirmeniz için size özel <span className="font-bold text-green-600">%10 ekstra indirim</span> sunuyoruz!
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-green-700">
                  <div className="font-bold text-lg mb-2">
                    💰 {formatUSDPrice(getSpecialOfferSavings())} Tasarruf!
                  </div>
                  <div>
                    • Normal yıllık indirim<br />
                    • <strong>+ Size özel %10 ekstra indirim</strong><br />
                    • 12 ay yerine tek seferde ödeme
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSpecialOfferDecline}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Hayır, Teşekkürler
                </button>
                <button
                  onClick={handleSpecialOfferAccept}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
                >
                  Kabul Ediyorum! 🎯
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Bu teklif sadece sizin için geçerlidir ve bir kez kullanılabilir.
              </p>
            </div>
            
            <button
              onClick={handleSpecialOfferDecline}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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