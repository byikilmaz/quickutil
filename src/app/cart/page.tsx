'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import Header from '@/components/Header';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { formatUSDPrice, calculateSavingsPercentage } from '@/lib/pricingUtils';
import Image from 'next/image';

export default function CartPage() {
  const { items, totalPrice, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Checkout logic burada olacak
    console.log('Proceeding to checkout with items:', items);
    // İyzico payment integration burada olacak
  };

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      if (item.period === 'annual' && item.originalPrice) {
        const annualPrice = item.originalPrice * 12;
        return total + (annualPrice - item.price);
      }
      return total;
    }, 0);
  };

  if (items.length === 0) {
    return (
      <>
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Empty Cart State */}
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8L9 13v6a1 1 0 001 1h4a1 1 0 001-1v-6m-6 0h6m-6 0V9a3 3 0 116 0v4m-6 0a2 2 0 104 0m-2-2h.01" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Sepetiniz Boş
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    QuickUtil Premium planlarımıza göz atarak başlayın!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/pricing"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Planları İncele
                  </Link>
                  <Link
                    href="/"
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Ana Sayfaya Dön
                  </Link>
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

  return (
    <>
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🛒 Sepetim
              </h1>
              <p className="text-gray-600">
                {items.length} ürün sepetinizde
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            item.name.includes('Premium') 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {item.name.includes('Premium') ? '⭐' : '💼'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm text-gray-700">
                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                          {item.features.length > 4 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{item.features.length - 4} daha fazla özellik
                            </p>
                          )}
                        </div>

                        {/* Period & Savings */}
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.period === 'annual' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.period === 'annual' ? 'Yıllık Plan' : 'Aylık Plan'}
                          </span>
                          
                          {item.period === 'annual' && item.originalPrice && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              %{calculateSavingsPercentage(item.originalPrice, item.price / 12)} Tasarruf
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="mb-4">
                          {item.period === 'annual' && item.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatUSDPrice(item.originalPrice)}/ay
                            </div>
                          )}
                          <div className="text-2xl font-bold text-gray-900">
                            {formatUSDPrice(item.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            /{item.period === 'annual' ? 'yıl' : 'ay'}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Kaldır</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                {items.length > 1 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Sepeti Temizle
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Sipariş Özeti
                  </h2>

                  {/* Items Summary */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name} ({item.period})</span>
                        <span className="font-medium">{formatUSDPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    {/* Savings */}
                    {getTotalSavings() > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <span>Toplam Tasarruf:</span>
                        <span className="font-medium">-{formatUSDPrice(getTotalSavings())}</span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                      <span className="text-2xl font-bold text-gray-900">{formatUSDPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Güvenli Ödeme</h3>
                    <div className="flex items-center justify-center space-x-3">
                      <Image 
                        src="/images/payment-methods/visa.png" 
                        alt="Visa"
                        width={60}
                        height={19}
                        className="h-5 w-auto"
                      />
                      <Image 
                        src="/images/payment-methods/mastercard.svg" 
                        alt="MasterCard"
                        width={60}
                        height={19}
                        className="h-5 w-auto"
                      />
                      <Image 
                        src="/images/payment-methods/iyzico.svg" 
                        alt="İyzico"
                        width={60}
                        height={19}
                        className="h-5 w-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      256-bit SSL şifrelemesi ile güvenli
                    </p>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {user ? 'Ödemeye Geç' : 'Giriş Yap ve Öde'}
                  </button>

                  {!user && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Ödeme için giriş yapmanız gerekiyor
                    </p>
                  )}

                  {/* Security Badges */}
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium">SSL Güvenli</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      3D Secure • PCI DSS Uyumlu
                    </p>
                  </div>
                </div>
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