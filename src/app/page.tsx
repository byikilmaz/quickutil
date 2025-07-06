'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  DocumentIcon, 
  PhotoIcon, 
  ArrowPathIcon, 
  CubeTransparentIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  PencilSquareIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import ToolCard from '@/components/ToolCard';
import Header from '@/components/Header';

// Lazy load non-critical components
const AuthModal = dynamic(() => import('@/components/AuthModal'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-96"></div>,
  ssr: false,
});

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toolCategories = [
    {
      id: 'pdf-tools',
      title: 'PDF İşlemleri',
      description: 'PDF dosyalarınızı sıkıştırın, dönüştürün ve düzenleyin',
      icon: DocumentIcon,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      tools: [
        {
          id: 'pdf-compress',
          title: 'PDF Sıkıştırma',
          description: 'PDF dosyalarınızı kaliteden ödün vermeden sıkıştırın',
          icon: DocumentArrowDownIcon,
          color: 'bg-blue-50 text-blue-600',
          href: '/pdf-compress'
        },
        {
          id: 'pdf-convert',
          title: 'PDF Dönüştürme',
          description: 'PDF\'leri farklı formatlara kolayca dönüştürün',
          icon: DocumentTextIcon,
          color: 'bg-blue-50 text-blue-600',
          href: '/pdf-convert'
        }
      ]
    },
    {
      id: 'image-tools',
      title: 'Fotoğraf İşlemleri',
      description: 'Fotoğraflarınızı düzenleyin, dönüştürün ve optimize edin',
      icon: PhotoIcon,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      tools: [
        {
          id: 'image-convert',
          title: 'Resim Dönüştürme',
          description: 'PNG, JPEG, WebP formatları arası dönüştürün',
          icon: PhotoIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-convert'
        },
        {
          id: 'image-compress',
          title: 'Resim Sıkıştırma',
          description: 'Resimlerinizi kaliteden ödün vermeden sıkıştırın',
          icon: ArrowPathIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-compress'
        },
        {
          id: 'image-resize',
          title: 'Resim Boyutlandırma',
          description: 'Resimlerinizi istediğiniz boyutlara getirin',
          icon: CubeTransparentIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-resize'
        },
        {
          id: 'image-crop',
          title: 'Resim Kırpma',
          description: 'Resimlerinizi istediğiniz alandan kırpın',
          icon: DocumentIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-crop'
        },
        {
          id: 'image-rotate',
          title: 'Resim Döndürme',
          description: 'Resimlerinizi istediğiniz açıda döndürün',
          icon: ArrowPathIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-rotate'
        },
        {
          id: 'image-filters',
          title: 'Resim Filtreleme',
          description: 'Professional filtrelerle resimlerinizi enhance edin',
          icon: SparklesIcon,
          color: 'bg-purple-50 text-purple-600',
          href: '/image-filters',
          badge: 'YENİ'
        }
      ]
    },
    {
      id: 'esign-tools',
      title: 'E-İmza Sistemi',
      description: 'PDF belgelerinizi dijital olarak imzalayın ve gönderin',
      icon: PencilSquareIcon,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      tools: [
        {
          id: 'pdf-esign',
          title: 'PDF E-İmza',
          description: 'PDF belgelerine dijital imza ekleyin ve gönderin',
          icon: PencilSquareIcon,
          color: 'bg-green-50 text-green-600',
          href: '/pdf-esign',
          badge: 'YENİ'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6">
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dosya İşleme Araçları
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              PDF sıkıştırma, format dönüştürme ve fotoğraf işleme işlemlerinizi
              <br />
              <span className="font-semibold text-yellow-300">ücretsiz</span> ve <span className="font-semibold text-yellow-300">hızlı</span> bir şekilde yapın
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Kayıt gerektirmez
              </div>
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verileriniz güvende
              </div>
              <div className="flex items-center gap-2 text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Hızlı işlem
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Araçlarımız
          </h2>
          <p className="text-xl text-gray-600">
            İhtiyacınız olan tüm dosya işleme araçları kategoriler halinde
          </p>
        </div>

        <div className="space-y-16">
          {toolCategories.map((category, categoryIndex) => (
            <div 
              key={category.id}
              className={`transition-all duration-1000 ${
                isLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${400 + categoryIndex * 200}ms` }}
            >
              {/* Category Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${category.color} text-white mb-4 shadow-lg`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Category Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, toolIndex) => (
                  <div 
                    key={tool.id}
                    className={`transition-all duration-700 ${
                      isLoaded 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${600 + categoryIndex * 200 + toolIndex * 100}ms` }}
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden QuickUtil?
            </h2>
            <p className="text-lg text-gray-600">
              Dosya işleme süreçlerinizi kolaylaştıran özellikleri keşfedin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Hızlı İşlem</h3>
              <p className="text-gray-600">Dosyalarınızı saniyeler içinde işleme alıyoruz</p>
            </div>
            
            <div className={`text-center transition-all duration-700 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Güvenli</h3>
              <p className="text-gray-600">Dosyalarınız işlem sonrası otomatik olarak silinir</p>
            </div>
            
            <div className={`text-center transition-all duration-700 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Ücretsiz</h3>
              <p className="text-gray-600">Tüm araçlarımızı ücretsiz kullanabilirsiniz</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl transition-all duration-1000 delay-1300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Daha Fazla Özellik mi Gerekiyor?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Premium özellikler ile dosya işleme süreçlerinizi bir üst seviyeye taşıyın. 
                Sınırsız kullanım, gelişmiş özellikler ve öncelik desteği.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sınırsız işlem
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Öncelik desteği
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gelişmiş özellikler
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Fiyatları İncele
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
