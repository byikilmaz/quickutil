'use client';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import StructuredData from '@/components/StructuredData';
import { 
  DocumentArrowDownIcon, 
  PhotoIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const pdfTools = [
    {
      icon: '🗜️',
      title: 'PDF Sıkıştırma',
      description: 'PDF dosyalarınızı kalitesini koruyarak küçültün',
      href: '/pdf-compress',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🔄',
      title: 'PDF Dönüştürme',
      description: 'PDF\'leri resim formatlarına dönüştürün',
      href: '/pdf-convert',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '✍️',
      title: 'E-İmza',
      description: 'PDF belgelerinize dijital imza ekleyin',
      href: '/pdf-esign',
      color: 'from-green-500 to-green-600'
    }
  ];

  const imageTools = [
    {
      icon: '🗜️',
      title: 'Resim Sıkıştırma',
      description: 'Resimlerinizi kalitesini koruyarak küçültün',
      href: '/image-compress',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '📏',
      title: 'Boyutlandırma',
      description: 'Resimlerinizin boyutlarını değiştirin',
      href: '/image-resize',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '✂️',
      title: 'Kırpma',
      description: 'Resimlerinizi istediğiniz alana kırpın',
      href: '/image-crop',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: '🔄',
      title: 'Döndürme',
      description: 'Resimlerinizi istediğiniz açıda döndürün',
      href: '/image-rotate',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: '⚡',
      title: 'Format Dönüştürme',
      description: 'Resimlerinizi farklı formatlara çevirin',
      href: '/image-format-convert',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: '🎨',
      title: 'Filtreler',
      description: 'Resimlerinize çeşitli efektler uygulayın',
      href: '/image-filters',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const features = [
    {
      icon: <BoltIcon className="h-8 w-8" />,
      title: 'Tamamen Ücretsiz',
      description: 'Tüm özelliklerimiz sonsuza kadar ücretsiz. Ödeme yok, abonelik yok.'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Güvenli & Gizli',
      description: 'Dosyalarınız SSL ile korunur ve işlem sonrası otomatik silinir.'
    },
    {
      icon: <CloudArrowUpIcon className="h-8 w-8" />,
      title: '30 Gün Saklama',
      description: 'Kayıtlı kullanıcılar dosyalarına 30 gün boyunca erişebilir.'
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8" />,
      title: 'Sınırsız Kullanım',
      description: 'Günlük limit yok, istediğiniz kadar dosya işleyebilirsiniz.'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        
        {/* Structured Data for SEO */}
        <StructuredData type="website" />
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              
              {/* Free Badge */}
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-in">
                🎉 Tamamen Ücretsiz! Tüm özellikler herkese açık
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickUtil.app
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto animate-slide-in">
                PDF sıkıştırma, resim düzenleme ve format dönüştürme araçlarının <strong>tamamı ücretsiz!</strong> 
                Hızlı, güvenli ve kullanımı kolay.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
                <Link
                  href="/pdf-compress"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 Hemen Başla - Ücretsiz!
                </Link>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  📝 Kayıt Ol (30 Gün Dosya Saklama)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Neden QuickUtil.app?
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Reklamlarla desteklenen hizmetimiz sayesinde tüm özelliklerimizi ücretsiz sunuyoruz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PDF Tools Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <DocumentArrowDownIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                📄 PDF Araçları
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                PDF dosyalarınızı sıkıştırın, dönüştürün ve dijital imza ekleyin
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pdfTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 group-hover:text-gray-800 transition-colors">
                    {tool.description}
                  </p>
                  <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Hemen Başla →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Image Tools Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <PhotoIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🖼️ Resim Araçları
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Resimlerinizi düzenleyin, sıkıştırın ve farklı formatlara dönüştürün
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imageTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-300 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 text-sm group-hover:text-gray-800 transition-colors">
                    {tool.description}
                  </p>
                  <div className="mt-3 text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors">
                    Kullan →
                  </div>
                </Link>
              ))}
            </div>

            {/* Batch Processing */}
            <div className="mt-12 text-center">
              <Link
                href="/image-batch"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ⚡ Toplu İşlem - Birden Fazla Dosya
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Hemen Başlayın - Tamamen Ücretsiz!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Kayıt olmadan da tüm araçları kullanabilirsiniz. Dosya saklamak için ücretsiz hesap oluşturun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pdf-compress"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                🚀 Araçları Kullan
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                📝 Ücretsiz Kayıt Ol
              </button>
            </div>
          </div>
        </section>
      </div>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
