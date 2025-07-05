'use client';
import { useState } from 'react';
import { 
  DocumentIcon, 
  PhotoIcon, 
  ArrowPathIcon, 
  CubeTransparentIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import AuthModal from '@/components/AuthModal';
import ToolCard from '@/components/ToolCard';
import Header from '@/components/Header';

// Test comment for GitHub Actions deployment test
export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tools = [
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
      icon: DocumentIcon,
      color: 'bg-green-50 text-green-600',
      href: '/pdf-convert'
    },
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
      title: 'Fotoğraf Sıkıştırma',
      description: 'Fotoğraflarınızı kaliteden ödün vermeden küçültün',
      icon: ArrowPathIcon,
      color: 'bg-orange-50 text-orange-600',
      href: '/image-compress'
    },
    {
      id: 'background-remove',
      title: 'Arka Plan Kaldırma',
      description: 'Fotoğraflarınızın arka planını otomatik kaldırın',
      icon: CubeTransparentIcon,
      color: 'bg-red-50 text-red-600',
      href: '/background-remove'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Dosya İşleme Araçları
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              PDF sıkıştırma, format dönüştürme ve fotoğraf işleme işlemlerinizi
              <br />
              <span className="font-semibold">ücretsiz</span> ve <span className="font-semibold">hızlı</span> bir şekilde yapın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-blue-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Kayıt gerektirmez
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verileriniz güvende
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Araçlarımız
          </h2>
          <p className="text-xl text-gray-600">
            İhtiyacınız olan tüm dosya işleme araçları tek yerde
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden QuickUtil?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hızlı İşlem</h3>
              <p className="text-gray-600">Dosyalarınızı saniyeler içinde işleme alıyoruz</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli</h3>
              <p className="text-gray-600">Dosyalarınız işlem sonrası otomatik olarak silinir</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ücretsiz</h3>
              <p className="text-gray-600">Tüm araçlarımızı ücretsiz kullanabilirsiniz</p>
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
