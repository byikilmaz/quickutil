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
  LightBulbIcon,
  DocumentIcon,
  PhotoIcon,
  ScissorsIcon,
  Square2StackIcon,
  PaintBrushIcon,
  ArrowsRightLeftIcon
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
      icon: DocumentIcon,
      title: tTools('pdfCompress'),
      description: tTools('pdfCompressDesc'),
      href: `/${locale}/pdf-compress`,
      aiFeature: '⚡ AI Optimization',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ArrowsRightLeftIcon,
      title: tTools('pdfConvert'),
      description: tTools('pdfConvertDesc'),
      href: `/${locale}/pdf-convert`,
      aiFeature: '🎯 Smart Format',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: PaintBrushIcon,
      title: tTools('pdfEsign'),
      description: tTools('pdfEsignDesc'),
      href: `/${locale}/pdf-esign`,
      aiFeature: '📍 Auto Position',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const imageTools = [
    {
      icon: PhotoIcon,
      title: tTools('imageCompress'),
      description: tTools('imageCompressDesc'),
      href: `/${locale}/image-compress`,
      aiFeature: '🔍 Content Analysis',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: ArrowsRightLeftIcon,
      title: tTools('imageResize'),
      description: tTools('imageResizeDesc'),
      href: `/${locale}/image-resize`,
      aiFeature: '⚖️ Smart Ratio',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: ScissorsIcon,
      title: tTools('imageCrop'),
      description: tTools('imageCropDesc'),
      href: `/${locale}/image-crop`,
      aiFeature: '👁️ Object Detection',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: ArrowsRightLeftIcon,
      title: tTools('imageRotate'),
      description: tTools('imageRotateDesc'),
      href: `/${locale}/image-rotate`,
      aiFeature: '📐 Auto Correct',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Square2StackIcon,
      title: tTools('imageFormat'),
      description: tTools('imageFormatDesc'),
      href: `/${locale}/image-format-convert`,
      aiFeature: '🎯 Format AI',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: PaintBrushIcon,
      title: tTools('imageFilters'),
      description: tTools('imageFiltersDesc'),
      href: `/${locale}/image-filters`,
      aiFeature: '✨ AI Effects',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  const features = [
    {
      icon: CpuChipIcon,
      title: t('features.ai'),
      description: t('features.aiDesc'),
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: BoltIcon,
      title: t('features.free'),
      description: t('features.freeDesc'),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: ShieldCheckIcon,
      title: t('features.secure'),
      description: t('features.secureDesc'),
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: SparklesIcon,
      title: t('features.smart'),
      description: t('features.smartDesc'),
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const aiFeatures = [
    {
      icon: LightBulbIcon,
      title: t('aiSection.feature1'),
      description: t('aiSection.feature1Desc'),
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: CpuChipIcon,
      title: t('aiSection.feature2'),
      description: t('aiSection.feature2Desc'),
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: RocketLaunchIcon,
      title: t('aiSection.feature3'),
      description: t('aiSection.feature3Desc'),
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 page-transition">
        
        {/* Structured Data for SEO */}
        <StructuredData type="website" />
        
        {/* Enhanced AI Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 overflow-hidden">
          
          {/* Floating Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-30"
                style={{
                  left: `${10 + i * 8}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.2}s`
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center">
              
              {/* Enhanced AI Badge with Animations */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-8 py-3 rounded-3xl text-sm font-bold mb-12 animate-bounce-in shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <CpuChipIcon className="h-4 w-4 text-white animate-pulse" />
                </div>
                <span>✨ AI Powered Platform ✨</span>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center ml-3">
                  <SparklesIcon className="h-4 w-4 text-white animate-spin" />
                </div>
              </div>
              
              {/* Enhanced Title with Gradient */}
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-8 tracking-tight animate-fade-in">
                {t('title')}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-800 mb-6 max-w-3xl mx-auto font-semibold animate-slide-in">
                {t('subtitle')}
              </p>
              
              <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto animate-slide-in" style={{ animationDelay: '0.2s' }}>
                {t('aiSubtitle')}
              </p>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <Link
                  href={`/${locale}/pdf-compress`}
                  className="group relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white px-12 py-5 rounded-3xl text-lg font-bold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 flex items-center space-x-3 transform hover:scale-105"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <RocketLaunchIcon className="h-5 w-5 text-white group-hover:animate-bounce" />
                  </div>
                  <span>🤖 {t('startButton')}</span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"></div>
                </Link>
                
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="group relative border-2 border-purple-300 text-purple-700 hover:border-purple-500 hover:text-purple-800 px-12 py-5 rounded-3xl text-lg font-bold transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>{t('signupButton')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced AI Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
                {locale === 'en' ? 'AI Features' : locale === 'es' ? 'Funciones de IA' : locale === 'fr' ? 'Fonctionnalités IA' : 'AI Özellikleri'}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
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
                  className="group relative bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Large Gradient Icon */}
                  <div className="text-center mb-8">
                    <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-10 w-10 text-white" />
                      
                      {/* Sparkle Effect */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <SparklesIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-center leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group text-center">
                  {/* Enhanced Icon with Gradient Background */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8" />
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce opacity-75">
                      <SparklesIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced AI PDF Tools Section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                <DocumentIcon className="h-4 w-4 mr-2" />
                {locale === 'en' ? 'PDF Tools' : locale === 'es' ? 'Herramientas PDF' : locale === 'fr' ? 'Outils PDF' : 'PDF Araçları'}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {t('pdfSection')}
              </h2>
              <p className="text-xl text-gray-700">
                {locale === 'en' ? 'Transform your PDF processing experience with AI' : locale === 'es' ? 'Transforma tu experiencia de procesamiento de PDF con IA' : locale === 'fr' ? 'Transformez votre expérience de traitement PDF avec l\'IA' : 'Yapay zeka ile PDF işleme deneyiminizi dönüştürün'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pdfTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group relative bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Large Tool Icon with Gradient Background */}
                  <div className="text-center mb-8">
                    <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <tool.icon className="h-10 w-10 text-white" />
                      
                      {/* Sparkle Effect */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <SparklesIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    {/* AI Feature Badge */}
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                      {tool.aiFeature}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 text-sm text-center leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced AI Image Tools Section */}
        <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                <PhotoIcon className="h-4 w-4 mr-2" />
                {locale === 'en' ? 'Image Tools' : locale === 'es' ? 'Herramientas de Imagen' : locale === 'fr' ? 'Outils Image' : 'Resim Araçları'}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                {t('imageSection')}
              </h2>
              <p className="text-xl text-gray-700">
                {locale === 'en' ? 'The art of image processing with smart algorithms' : locale === 'es' ? 'El arte del procesamiento de imágenes con algoritmos inteligentes' : locale === 'fr' ? 'L\'art du traitement d\'images avec des algorithmes intelligents' : 'Akıllı algoritmalar ile resim işleme sanatı'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imageTools.map((tool, index) => (
                <Link
                  key={index}
                  href={tool.href}
                  className="group relative bg-white rounded-3xl border-2 border-gray-200 p-8 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-from-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Large Tool Icon with Gradient Background */}
                  <div className="text-center mb-6">
                    <div className={`relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <tool.icon className="h-8 w-8 text-white" />
                      
                      {/* Sparkle Effect */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <SparklesIcon className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    
                    {/* AI Feature Badge */}
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                      {tool.aiFeature}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    {tool.title}
                  </h3>
                  <p className="text-gray-700 text-sm text-center leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>

            {/* Enhanced Batch Processing Button */}
            <div className="mt-16 text-center">
              <Link
                href={`/${locale}/image-batch`}
                className="group relative inline-flex items-center bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white px-12 py-5 rounded-3xl text-lg font-bold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <RocketLaunchIcon className="h-5 w-5 text-white group-hover:animate-bounce" />
                </div>
                <span>🚀 {tTools('batchProcessing')}</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center ml-3">
                  <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"></div>
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced AI CTA Section */}
        <section className="py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white relative overflow-hidden">
          
          {/* Background Animation Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-pulse opacity-20"
                style={{
                  left: `${5 + i * 6}%`,
                  top: `${10 + (i % 4) * 20}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${3 + i * 0.3}s`
                }}
              />
            ))}
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            {/* Enhanced AI Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <CpuChipIcon className="h-12 w-12 text-white" />
              </div>
              
              {/* Floating Sparkles */}
              <div className="relative">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-70"
                    style={{
                      left: `${40 + i * 5}%`,
                      top: `${-20 + (i % 2) * 10}px`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              {t('ctaTitle')}
            </h2>
            <p className="text-xl mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {t('ctaDesc')}
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href={`/${locale}/pdf-compress`}
                className="group relative bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 hover:from-cyan-600 hover:via-cyan-700 hover:to-blue-600 text-white px-12 py-5 rounded-3xl text-lg font-bold transition-all duration-500 shadow-2xl hover:shadow-cyan-500/40 flex items-center justify-center space-x-3 transform hover:scale-105"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <RocketLaunchIcon className="h-5 w-5 text-white group-hover:animate-bounce" />
                </div>
                <span>🤖 {t('startButton')}</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"></div>
              </Link>
              
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="group relative border-2 border-gray-400 hover:border-cyan-400 text-white hover:text-cyan-300 px-12 py-5 rounded-3xl text-lg font-bold transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <span>{t('signupButton')}</span>
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
