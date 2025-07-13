'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  CloudArrowUpIcon, 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CpuChipIcon,
  CircleStackIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  CpuChipIcon as CpuChipIconSolid,
  SparklesIcon as SparklesIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { getTranslations } from '@/lib/translations';

interface CompressionResult {
  file: File;
  originalFile?: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
}

// Server compression options
interface ServerCompressionOptions {
  quality: number;
  format: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC';
  mode: 'balanced' | 'aggressive';
}

// AI Processing Animation Component
function AIProcessingIndicator() {
  return (
    <div className="relative">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-4 gap-2 h-full">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i}
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* AI Brain Icon */}
      <div className="relative z-10 flex items-center justify-center h-32">
        <div className="relative">
          <CpuChipIconSolid className="h-16 w-16 text-purple-600 animate-pulse" />
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 300}ms`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// AI Smart Badge Component
function AISmartBadge({ icon: Icon, text, delay = 0 }: { icon: any, text: string, delay?: number }) {
  return (
    <div 
      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg animate-slide-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{text}</span>
      <SparklesIconSolid className="h-3 w-3 animate-pulse" />
    </div>
  );
}

// Floating AI Elements
function FloatingAIElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating brain chips */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            top: `${20 + i * 30}%`,
            left: `${10 + i * 25}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '6s'
          }}
        >
          <CpuChipIcon className="h-8 w-8 text-purple-300 opacity-30" />
        </div>
      ))}
      
      {/* Floating sparkles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-bounce"
          style={{
            top: `${15 + i * 20}%`,
            right: `${5 + i * 15}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: '3s'
          }}
        >
          <SparklesIcon className="h-6 w-6 text-pink-300 opacity-40" />
        </div>
      ))}
    </div>
  );
}

export default async function ImageCompressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ImageCompress locale={locale} />;
}

function ImageCompress({ locale }: { locale: string }) {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Translation helper
  const t = getTranslations(locale);
  const getText = (key: string, fallback: string) => {
    // AI-themed translations
    const aiTranslations: { [key: string]: string } = {
      'ai.poweredBy': locale === 'tr' ? 'Yapay Zeka Destekli' : 'AI-Powered',
      'ai.smartCompression': locale === 'tr' ? 'Akıllı Sıkıştırma' : 'Smart Compression',
      'ai.analyzing': locale === 'tr' ? 'AI Analiz Ediyor...' : 'AI Analyzing...',
      'ai.optimizing': locale === 'tr' ? 'AI Optimize Ediyor...' : 'AI Optimizing...',
      'ai.processing': locale === 'tr' ? 'AI İşliyor...' : 'AI Processing...',
      'ai.intelligent': locale === 'tr' ? 'Akıllı Algoritma' : 'Intelligent Algorithm',
      'ai.advanced': locale === 'tr' ? 'Gelişmiş AI' : 'Advanced AI',
      'ai.quality': locale === 'tr' ? 'AI Kalite Kontrolü' : 'AI Quality Control',
      
      // Main content
      'imageCompress.title': locale === 'tr' ? 'AI Destekli Resim Sıkıştırma' : 'AI-Powered Image Compression',
      'imageCompress.subtitle': locale === 'tr' ? 
        'Yapay zeka teknolojisi ile resimlerinizi maksimum kalitede sıkıştırın' : 
        'Compress your images with maximum quality using AI technology',
        
      'fileUpload.title': locale === 'tr' ? 'Resminizi Seçin' : 'Select Your Image',
      'fileUpload.description': locale === 'tr' ? 'Sıkıştırılacak resim dosyasını seçin' : 'Choose an image file to compress',
      
      'processing.analyzing': locale === 'tr' ? 'AI resminizi analiz ediyor...' : 'AI is analyzing your image...',
      'processing.complete': locale === 'tr' ? 'Tamamlandı' : 'Complete',
      
      'result.success': locale === 'tr' ? 'AI Sıkıştırma Tamamlandı!' : 'AI Compression Complete!',
      'result.download': locale === 'tr' ? 'Sıkıştırılmış Resmi İndir' : 'Download Compressed Image',
      'result.newCompression': locale === 'tr' ? 'Yeni Resim Sıkıştır' : 'Compress New Image',
      'result.originalSize': locale === 'tr' ? 'Orijinal Boyut' : 'Original Size',
      'result.compressedSize': locale === 'tr' ? 'Sıkıştırılmış Boyut' : 'Compressed Size',
      'result.savings': locale === 'tr' ? 'Tasarruf' : 'Space Saved',
      
      'features.intelligent': locale === 'tr' ? 'Akıllı Sıkıştırma' : 'Intelligent Compression',
      'features.intelligentDesc': locale === 'tr' ? 'AI her resim için en uygun ayarları belirler' : 'AI determines optimal settings for each image',
      'features.quality': locale === 'tr' ? 'Kalite Korunması' : 'Quality Preservation',
      'features.qualityDesc': locale === 'tr' ? 'Görsel kaliteyi maksimum düzeyde korur' : 'Preserves visual quality at maximum level',
      'features.speed': locale === 'tr' ? 'Hızlı İşlem' : 'Fast Processing',
      'features.speedDesc': locale === 'tr' ? 'Saniyeler içinde profesyonel sonuçlar' : 'Professional results in seconds'
    };
    
    // Check AI translations first, then standard translations
    if (aiTranslations[key]) {
      return aiTranslations[key];
    }
    
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || fallback;
    } catch {
      return fallback;
    }
  };

  // Component state - Simplified 3-step flow: upload -> processing -> result
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [heicNotification, setHeicNotification] = useState<string | null>(null);
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when step changes - Improved for better UX
  useEffect(() => {
    const scrollToStep = () => {
      let targetElement: HTMLDivElement | null = null;
      
      switch (currentStep) {
        case 'upload':
          targetElement = uploadRef.current;
          break;
        case 'processing':
          targetElement = processingRef.current;
          break;
        case 'result':
          targetElement = resultRef.current;
          break;
      }
      
      if (targetElement) {
        // Smooth scroll with proper offset for mobile
        setTimeout(() => {
          const offsetTop = targetElement!.offsetTop - 80; // Account for header
          window.scrollTo({ 
            top: offsetTop, 
            behavior: 'smooth' 
          });
        }, 300);
      }
    };

    scrollToStep();
  }, [currentStep]);

  const handleFileSelect = async (file: File) => {
    console.log('File selected:', file.name);
    setSelectedFile(file);
    setError(null);
    setCurrentStep('upload');
    
    // Check if HEIC
    if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
      setHeicNotification(getText('imageCompress.heicNotice', 'HEIC dosyalar PNG formatına dönüştürülecek'));
    }
    
    // Auto-start compression after short delay
    setTimeout(async () => {
      await handleCompress(file);
    }, 800);
  };

  const handleCompress = async (file?: File) => {
    const fileToCompress = file || selectedFile;
    if (!fileToCompress) return;

    // Check quota before processing
    const canProcess = await canUseFeature('image_compress');
    if (!canProcess) {
      if (!user) {
        setShowAuthModal(true);
        return;
      } else {
        setError(getText('quota.dailyLimitReached', 'Günlük limit aşıldı. Premium hesaba geçin.'));
        return;
      }
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    setError(null);
    setProcessingProgress(0);

    try {
      // AI Processing simulation with progress
      const progressSteps = [10, 25, 50, 75, 90];
      for (let i = 0; i < progressSteps.length; i++) {
        setProcessingProgress(progressSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Auto-detect format from file
      const fileExtension = fileToCompress.name.split('.').pop()?.toLowerCase();
      let autoFormat: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC' = 'JPEG';
      
      if (fileExtension === 'png') autoFormat = 'PNG';
      else if (fileExtension === 'webp') autoFormat = 'WEBP';  
      else if (fileExtension === 'heic' || fileExtension === 'heif') autoFormat = 'HEIC';
      else autoFormat = 'JPEG';

      // Server compression with AI-optimized settings
      const serverOptions: ServerCompressionOptions = {
        quality: 80, // AI-optimized quality
        format: autoFormat, // Keep original format
        mode: 'aggressive' as const
      };

      const serverResult = await compressImageOnServer(fileToCompress, serverOptions);
      
      if (serverResult.success && serverResult.compressedBlob) {
        const compressionRatio = ((fileToCompress.size - serverResult.compressedBlob.size) / fileToCompress.size) * 100;
        
        setCompressionResult({
          file: fileToCompress,
          originalFile: fileToCompress,
          compressedBlob: serverResult.compressedBlob,
          originalSize: fileToCompress.size,
          compressedSize: serverResult.compressedBlob.size,
          compressionRatio,
          downloadUrl: URL.createObjectURL(serverResult.compressedBlob)
        });

        setProcessingProgress(100);

        setTimeout(() => {
          setCurrentStep('result');
        }, 500);
      } else {
        throw new Error(serverResult.error || getText('error.compressionFailed', 'Sıkıştırma başarısız'));
      }
    } catch (err) {
      console.error('Compression error:', err);
      setError(err instanceof Error ? err.message : getText('error.unknown', 'Bilinmeyen hata'));
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setCurrentStep('upload');
    setError(null);
    setProcessingProgress(0);
    setHeicNotification(null);
    
    // Clean up object URLs
    if (compressionResult?.downloadUrl) {
      URL.revokeObjectURL(compressionResult.downloadUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Server compression function - Fixed form data handling
  async function compressImageOnServer(file: File, options: ServerCompressionOptions) {
    try {
      console.log('Compressing on server with options:', options);
      
          const formData = new FormData();
    formData.append('file', file); // ✅ Backend 'file' key'ini bekliyor
    formData.append('quality', options.quality.toString());
    formData.append('format', options.format.toLowerCase()); // Convert to lowercase
    formData.append('mode', options.mode);

      console.log('Sending request to quickutil-image-api...');
      const response = await fetch('https://quickutil-image-api.onrender.com/compress', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const compressedBlob = await response.blob();
      console.log('Compression successful, blob size:', compressedBlob.size);
      
      return { success: true, compressedBlob };
    } catch (error) {
      console.error('Server compression error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Compression failed' 
      };
    }
  }

  return (
    <>
      <StructuredData type="tool" />

      {/* Responsive container with better mobile experience */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
        {/* Floating AI Background Elements */}
        <FloatingAIElements />
        
        {/* Hero Section with AI Theme - Responsive */}
        <div className="relative pt-16 md:pt-20 pb-8 md:pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* AI Badge - Responsive */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 rounded-full shadow-lg mb-4 md:mb-6 animate-bounce-in text-sm md:text-base">
              <CpuChipIconSolid className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-medium">{getText('ai.poweredBy', 'AI-Powered')}</span>
              <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
            </div>
            
            {/* Title - Responsive */}
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 px-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                {getText('imageCompress.title', 'AI-Powered Image Compression')}
              </span>
            </h1>
            
            {/* Subtitle - Responsive */}
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
              {getText('imageCompress.subtitle', 'Compress your images with maximum quality using AI technology')}
            </p>

            {/* AI Features - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12 px-2">
              <AISmartBadge 
                icon={BeakerIconSolid} 
                text={getText('features.intelligent', 'Intelligent Compression')} 
                delay={0}
              />
              <AISmartBadge 
                icon={SparklesIconSolid} 
                text={getText('features.quality', 'Quality Preservation')} 
                delay={200}
              />
              <AISmartBadge 
                icon={BoltIcon} 
                text={getText('features.speed', 'Fast Processing')} 
                delay={400}
              />
            </div>
          </div>
        </div>

        {/* Main Content Container - Responsive */}
        <div className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
          {/* Upload Step - Responsive */}
          {currentStep === 'upload' && (
            <div ref={uploadRef} className="animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-4 md:p-8 mb-6 md:mb-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-purple-100 to-pink-100 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl mb-4">
                    <CircleStackIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    <span className="text-base md:text-lg font-semibold text-purple-800">
                      {getText('ai.smartCompression', 'Smart Compression')}
                    </span>
                  </div>
                </div>

                <FileUpload
                  onFileSelect={(file) => {
                    const selectedFile = Array.isArray(file) ? file[0] : file;
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']}
                  maxSize={20 * 1024 * 1024} // 20MB
                  title={getText('fileUpload.title', 'Select Your Image')}
                  description={getText('fileUpload.description', 'Choose an image file to compress and optimize')}
                />

                {/* AI Features Grid - Responsive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl border border-purple-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <CpuChipIconSolid className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('features.intelligent', 'Intelligent Compression')}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-700">
                      {getText('features.intelligentDesc', 'AI determines optimal settings for each image')}
                    </p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl md:rounded-2xl border border-pink-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <SparklesIconSolid className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-pink-900 mb-2 text-sm md:text-base">
                      {getText('features.quality', 'Quality Preservation')}
                    </h3>
                    <p className="text-xs md:text-sm text-pink-700">
                      {getText('features.qualityDesc', 'Preserves visual quality at maximum level')}
                    </p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl md:rounded-2xl border border-purple-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <BoltIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('features.speed', 'Fast Processing')}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-700">
                      {getText('features.speedDesc', 'Professional results in seconds')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message - Responsive */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 md:h-6 md:w-6 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 font-medium text-sm md:text-base">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Processing Step - Responsive */}
          {currentStep === 'processing' && (
            <div ref={processingRef} className="text-center animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12 mb-6 md:mb-8 mx-auto max-w-2xl">
                <div className="max-w-md mx-auto">
                  {/* AI Processing Animation */}
                  <AIProcessingIndicator />
                  
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    {getText('ai.processing', 'AI Processing...')}
                  </h2>
                  <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                    {getText('processing.analyzing', 'AI is analyzing your image...')}
                  </p>

                  {/* AI Progress Bar - Responsive */}
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-4 md:mb-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 md:h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${processingProgress}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">
                    {processingProgress}% {getText('processing.complete', 'Complete')}
                  </p>

                  {/* AI Processing Badges - Responsive */}
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 md:mt-8">
                    <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 md:px-4 py-2 rounded-full">
                      <BeakerIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm">{getText('ai.intelligent', 'Intelligent Algorithm')}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-pink-100 text-pink-800 px-3 md:px-4 py-2 rounded-full">
                      <LightBulbIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm">{getText('ai.quality', 'AI Quality Control')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Success Result Step - Responsive */}
          {currentStep === 'result' && compressionResult && (
            <div ref={resultRef} className="animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-4 md:p-8 mb-6 md:mb-8">
                {/* Success Header with AI Theme - Responsive */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 md:mb-6 animate-bounce-in">
                    <CheckCircleIcon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    {getText('result.success', 'AI Compression Complete!')}
                  </h2>
                  
                  {/* AI Success Badges - Responsive */}
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 md:px-4 py-2 rounded-full">
                      <CpuChipIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm font-medium">{getText('ai.advanced', 'Advanced AI')}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 md:px-4 py-2 rounded-full">
                      <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm font-medium">{getText('ai.quality', 'AI Quality Control')}</span>
                    </div>
                  </div>
                </div>

                {/* Compression Results with AI Styling - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">
                      {getText('result.originalSize', 'Original Size')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-blue-800">
                      {formatFileSize(compressionResult.originalSize)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2 text-sm md:text-base">
                      {getText('result.compressedSize', 'Compressed Size')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-green-800">
                      {formatFileSize(compressionResult.compressedSize)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('result.savings', 'Space Saved')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-purple-800">
                      {compressionResult.compressionRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Action Buttons with AI Styling - Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <a
                    href={compressionResult.downloadUrl}
                    download={`compressed_ai_${compressionResult.file.name}`}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 md:space-x-3 group text-sm md:text-base"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce" />
                    <span>{getText('result.download', 'Download Compressed Image')}</span>
                    <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
                  </a>
                  
                  <button
                    onClick={handleReset}
                    className="bg-white text-purple-600 border-2 border-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm md:text-base"
                  >
                    <CpuChipIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>{getText('result.newCompression', 'Compress New Image')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 