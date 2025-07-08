'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import StructuredData from '@/components/StructuredData';
import { useTranslations } from '@/lib/translations';
import { 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
  CpuChipIcon,
  SparklesIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function HomePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'tr';
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Translation hooks
  const t = useTranslations('homepage', locale);
  const tTools = useTranslations('tools', locale);

  const pdfTools = [
    {
      icon: '🤖',
      title: tTools('pdfCompress'),
      description: tTools('pdfCompressDesc'),
      href: `/${locale}/pdf-compress`,
      aiFeature: '⚡ AI Optimization'
    },
    {
      icon: '🧠',
      title: tTools('pdfConvert'),
      description: tTools('pdfConvertDesc'),
      href: `/${locale}/pdf-convert`,
      aiFeature: '🎯 Smart Format'
    },
    {
      icon: '✨',
      title: tTools('pdfEsign'),
      description: tTools('pdfEsignDesc'),
      href: `/${locale}/pdf-esign`,
      aiFeature: '📍 Auto Position'
    }
  ];

  const imageTools = [
    {
      icon: '🤖',
      title: tTools('imageCompress'),
      description: tTools('imageCompressDesc'),
      href: `/${locale}/image-compress`,
      aiFeature: '🔍 Content Analysis'
    },
    {
      icon: '📐',
      title: tTools('imageResize'),
      description: tTools('imageResizeDesc'),
      href: `/${locale}/image-resize`,
      aiFeature: '⚖️ Smart Ratio'
    },
    {
      icon: '✂️',
      title: tTools('imageCrop'),
      description: tTools('imageCropDesc'),
      href: `/${locale}/image-crop`,
      aiFeature: '👁️ Object Detection'
    },
    {
      icon: '🔄',
      title: tTools('imageRotate'),
      description: tTools('imageRotateDesc'),
      href: `/${locale}/image-rotate`,
      aiFeature: '📐 Auto Correct'
    },
    {
      icon: '🔧',
      title: tTools('imageFormat'),
      description: tTools('imageFormatDesc'),
      href: `/${locale}/image-format-convert`,
      aiFeature: '🎯 Format AI'
    },
    {
      icon: '🎨',
      title: tTools('imageFilters'),
      description: tTools('imageFiltersDesc'),
      href: `/${locale}/image-filters`,
      aiFeature: '✨ AI Effects'
    }
  ];

  const features = [
    {
      icon: <CpuChipIcon className="h-6 w-6" />,
      title: t('features.ai'),
      description: t('features.aiDesc')
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: t('features.free'),
      description: t('features.freeDesc')
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: t('features.secure'),
      description: t('features.secureDesc')
    },
    {
      icon: <SparklesIcon className="h-6 w-6" />,
      title: t('features.smart'),
      description: t('features.smartDesc')
    }
  ];

  const aiFeatures = [
    {
      icon: <LightBulbIcon className="h-8 w-8" />,
      title: t('aiSection.feature1'),
      description: t('aiSection.feature1Desc')
    },
    {
      icon: <CpuChipIcon className="h-8 w-8" />,
      title: t('aiSection.feature2'),
      description: t('aiSection.feature2Desc')
    },
    {
      icon: <RocketLaunchIcon className="h-8 w-8" />,
      title: t('aiSection.feature3'),
      description: t('aiSection.feature3Desc')
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-white page-transition">
        
        {/* Structured Data for SEO */}
        <StructuredData type="website" />
        
        {/* AI Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              
              {/* AI Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-in">
                <CpuChipIcon className="h-4 w-4 mr-2" />
                AI Powered Platform
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-black mb-6 tracking-tight">
                {t('title')}
              </h1>
              
              <p className="text-xl md:text-2xl text-black mb-4 max-w-3xl mx-auto font-medium">
                {t('subtitle')}
              </p>
              
              <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
                {t('aiSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={`/${locale}/pdf-compress`}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🤖 {t('startButton')}
                </Link>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="border border-gray-300 text-black px-12 py-4 rounded-full text-lg font-medium hover:border-blue-500 hover:text-blue-600 apple-button-hover"
                >
                  {t('signupButton')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Section - NEW */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                {t('aiSection.title')}
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {t('aiSection.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {aiFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">
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

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI PDF Tools Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">
                {t('pdfSection')}
              </h2>
              <p className="text-lg text-gray-700">
                Yapay zeka ile PDF işleme deneyiminizi dönüştürün
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pdfTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 animate-fade-in shadow-lg hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                      {tool.icon}
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      {tool.aiFeature}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-3">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AI Image Tools Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">
                {t('imageSection')}
              </h2>
              <p className="text-lg text-gray-700">
                Akıllı algoritmalar ile resim işleme sanatı
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imageTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50 transition-all duration-300 transform hover:scale-105 animate-slide-from-right shadow-lg hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-lg">
                      {tool.icon}
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      {tool.aiFeature}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Batch Processing */}
            <div className="mt-12 text-center">
              <Link
                href={`/${locale}/image-batch`}
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 {tTools('batchProcessing')}
              </Link>
            </div>
          </div>
        </section>

        {/* AI CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-cyan-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-6">
              <CpuChipIcon className="h-16 w-16 mx-auto text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {t('ctaTitle')}
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/pdf-compress`}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🤖 {t('startButton')}
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="border border-gray-400 text-white px-8 py-4 rounded-full text-lg font-medium hover:border-cyan-400 hover:text-cyan-400 apple-button-hover"
              >
                {t('signupButton')}
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
