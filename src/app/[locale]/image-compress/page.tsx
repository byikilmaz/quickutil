'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowPathIcon, SparklesIcon, PhotoIcon, CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { getTranslations } from '@/lib/translations';
import { isHEICFormat, convertHEICToJPEG } from '@/lib/imageUtils';
import { 
  compressImageWithServer, 
  checkAPIHealth, 
  validateImageFile,
  formatFileSize as serverFormatFileSize,
  getCompressionSavings,
  type ServerCompressionOptions,
  type ServerCompressionResult
} from '@/lib/serverImageUtils';

interface CompressionResult {
  file: File;
  originalFile?: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
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
  
  const t = getTranslations(locale);

  // Get localized text helper function
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };
  
  // Component state - Step-based like PDF convert
  const [currentStep, setCurrentStep] = useState<'upload' | 'file-loading' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // NEW: For HEIC preview
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp' | 'heic'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heicNotification, setHeicNotification] = useState<string | null>(null);

  // Refs for smooth scrolling and auto-focus
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus to upload area on page load
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        // Focus on the upload area for accessibility
        const fileInput = uploadRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.focus();
        }
      }, 500);
    }
  }, [currentStep]);

  // NEW: Generate preview URL for HEIC files
  const generatePreviewUrl = async (file: File) => {
    if (isHEICFormat(file)) {
      try {
        console.log('🖼️ HEIC detected, converting for preview...');
        const convertedFile = await convertHEICToJPEG(file);
        const previewUrl = URL.createObjectURL(convertedFile);
        setPreviewUrl(previewUrl);
        console.log('✅ HEIC preview generated successfully');
      } catch (error) {
        console.error('❌ HEIC preview generation failed:', error);
        setPreviewUrl(null);
      }
    } else {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };

  // File selection handler
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    try {
      setError(null);
      setSelectedFile(file);
      
      // Move to file-loading step immediately
      setCurrentStep('file-loading');
      
      // 🎯 AUTO FORMAT SELECTION: Detect input format and set as default
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let autoFormat: 'jpeg' | 'png' | 'webp' | 'heic' = 'jpeg';
      
      if (fileExtension === 'png') {
        autoFormat = 'png';
      } else if (fileExtension === 'webp') {
        autoFormat = 'webp';
      } else if (fileExtension === 'heic' || fileExtension === 'heif') {
        // ✅ HEIC → HEIC: Backend now supports native HEIC compression!
        autoFormat = 'heic';
        console.log('✅ HEIC → HEIC (native HEIC compression active)');
        
        // Show user notification about HEIC format
        setHeicNotification(
          locale === 'en' 
            ? '📱 HEIC file detected! It will be compressed in original HEIC format.' 
            : '📱 HEIC dosyası algılandı! Orijinal HEIC formatında sıkıştırılacak.'
        );
        setTimeout(() => {
          setHeicNotification(null);
        }, 5000);
      } else {
        autoFormat = 'jpeg'; // Default for JPG, JPEG, and others
      }
      
      setFormat(autoFormat);
      console.log(`🎯 Auto format selection: ${file.name} (${file.type}) -> ${autoFormat}`);
      
      // Handle HEIC format for preview (with loading feedback)
      if (isHEICFormat(file)) {
        console.log('🖼️ HEIC detected, converting for preview...');
        setPreviewUrl(null);
        
        try {
          const convertedBlob = await convertHEICToJPEG(file);
          const previewUrl = URL.createObjectURL(convertedBlob);
          setPreviewUrl(previewUrl);
          console.log('✅ HEIC preview generated successfully');
        } catch (conversionError) {
          console.error('❌ HEIC preview conversion failed:', conversionError);
          setError(
            locale === 'en' 
              ? 'Could not create HEIC file preview' 
              : 'HEIC dosyası önizlemesi oluşturulamadı'
          );
          setCurrentStep('upload'); // Go back to upload on error
          return;
        }
      } else {
        // Regular image preview
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);
      }
      
      // Move to configure step after processing is complete
      setCurrentStep('configure');
      
      // Smooth scroll to configure section with mobile optimization
      setTimeout(() => {
        configureRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
      
    } catch (error) {
      console.error('File selection error:', error);
      setError(
        locale === 'en' 
          ? 'Error occurred while selecting file' 
          : 'Dosya seçilirken hata oluştu'
      );
      setCurrentStep('upload'); // Go back to upload on error
    }
  };

  // Compression handler
  const handleCompress = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setCurrentStep('processing');
      setError(null);

      // Smooth scroll to processing section with mobile optimization
      setTimeout(() => {
        processingRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

      // Animate progress bar
      setProcessingProgress(0);
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Check if we have an already processed file (e.g., from HEIC conversion)
      const processedFile = selectedFile;
      
      console.log('🔄 Starting compression process...');
      console.log('📁 File details:', {
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type
      });

      let result: CompressionResult;

      // Check if server API is available
      const apiAvailable = await checkAPIHealth();
      console.log('🌐 API Health Check:', apiAvailable);

      if (apiAvailable) {
        // Use server-side compression
        console.log('🚀 Using server-side compression...');
        
        const serverOptions = {
          quality: Math.round(quality * 100),
          format: format.toUpperCase() as 'JPEG' | 'PNG' | 'WEBP' | 'HEIC',
          mode: 'aggressive' as const
        };

        console.log('⚙️ Server compression options:', serverOptions);

        const serverResult = await compressImageWithServer(processedFile, serverOptions);
        
        console.log('✅ Server compression completed:', {
          originalSize: serverResult.originalSize,
          compressedSize: serverResult.compressedSize,
          compressionRatio: serverResult.compressionRatio,
          metadata: serverResult.metadata
        });

        // Create compression result from server response
        result = {
          file: serverResult.file,
          originalFile: processedFile,
          compressedBlob: serverResult.compressedBlob,
          originalSize: serverResult.originalSize,
          compressedSize: serverResult.compressedSize,
          compressionRatio: serverResult.compressionRatio,
          downloadUrl: serverResult.downloadUrl
        };

        console.log('📊 Final compression result:', {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          downloadUrl: result.downloadUrl ? 'URL exists' : 'URL missing',
          'result.originalSize type': typeof result.originalSize,
          'result.compressedSize type': typeof result.compressedSize,
          'result.originalSize value': result.originalSize,
          'result.compressedSize value': result.compressedSize
        });
        
      } else {
        // Mobile-optimized client compression
        console.log('📱 Using client-side compression...');
        
        const { compressImageAdvanced, getMobileOptimizedSettings } = await import('@/lib/imageUtils');
        
        // Get mobile-optimized compression settings
        const optimizedSettings = getMobileOptimizedSettings(processedFile.size, processedFile.type);
        
        // Apply user preferences to optimized settings
        const finalSettings = {
          ...optimizedSettings,
          quality: optimizedSettings.quality * quality, // Apply user quality preference
          format: format as 'png' | 'jpeg' | 'webp' | 'heic' // Apply user format preference
        };
        
        console.log('🎯 Using mobile-optimized compression:', finalSettings);
        
        const clientResult = await compressImageAdvanced(processedFile, finalSettings);
        
        result = {
          file: clientResult.file,
          originalFile: processedFile,
          compressedBlob: new Blob([clientResult.file]),
          originalSize: clientResult.originalSize,
          compressedSize: clientResult.newSize || clientResult.file.size,
          compressionRatio: (1 - clientResult.compressionRatio) * 100,
          downloadUrl: URL.createObjectURL(clientResult.file)
        };

        console.log('📊 Client compression result:', result);
      }
      
      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Validate result before setting state
      if (!result.originalSize || !result.compressedSize) {
        throw new Error('Compression metadata is missing or invalid');
      }

      console.log('✅ Setting compression result state:', {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        downloadUrl: result.downloadUrl ? 'URL created' : 'Missing URL'
      });

      setCompressionResult(result);
      setCurrentStep('result');
      setIsProcessing(false);

      // Smooth scroll to result section with mobile optimization
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (
        locale === 'en' ? 'Unknown error occurred' : 'Bilinmeyen hata oluştu'
      );
      console.error('❌ Compression error:', err);
      setError(
        locale === 'en' 
          ? `An error occurred while compressing the image: ${errorMessage}`
          : `Resim sıkıştırılırken bir hata oluştu: ${errorMessage}`
      );
      setIsProcessing(false);
      setCurrentStep('configure');
    }
  };

  // Reset handler
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null); // Reset preview URL
    setCompressionResult(null);
    setCurrentStep('upload');
    setIsProcessing(false);
    setProcessingProgress(0);
    setError(null);
    setHeicNotification(null); // Reset HEIC notification
    setQuality(0.8);
    setFormat('jpeg');
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-purple-300/20 rounded-full animate-pulse"
            style={{
              left: `${5 + (i * 4.5) % 95}%`,
              top: `${10 + (i * 7) % 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
      
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Breadcrumb */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-purple-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        </div>
      </div>

      <div className="relative z-10">
        
        {/* STEP 1: UPLOAD */}
        <div ref={uploadRef} className={`py-6 md:py-12 transition-all duration-500 ${
          currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Step Indicator */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-base font-bold shadow-lg mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                  1
                </div>
{locale === 'en' ? '📸 Image Selection' : '📸 Resim Seçimi'}
              </div>
              <div className="inline-flex items-center bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                <SparklesIcon className="h-3 w-3 mr-1 text-purple-600 animate-pulse" />
{locale === 'en' ? '✨ 2M+ Images Compressed' : '✨ 2M+ Resim Sıkıştırıldı'}
              </div>
            </div>

            {/* Enhanced Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-3">
{locale === 'en' ? '🖼️ Image Compression' : '🖼️ Resim Sıkıştırma'}
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
{locale === 'en' ? 'Compress your images while preserving quality with AI-powered technology' : 'Yapay zeka destekli teknoloji ile resimlerinizi kalitesini koruyarak sıkıştırın'}
              </p>
            </div>

            {/* Enhanced Upload Button */}
            <div className="max-w-md mx-auto text-center">
              <div className="relative group cursor-pointer">
                {/* Main Upload Button */}
                <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-2xl px-8 py-6 text-lg font-bold transition-all duration-500 shadow-xl hover:shadow-purple-500/40 flex flex-col items-center justify-center transform hover:scale-105 group-hover:rotate-1">
                  
                  {/* Animated Upload Icon */}
                  <div className="relative mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PhotoIcon className="h-6 w-6 text-white group-hover:animate-bounce" />
                    </div>
                    
                    {/* Floating Plus Icons */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center animate-ping opacity-75">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  
                  {/* Dynamic Text */}
                  <div className="text-center">
                    <div className="text-lg font-bold mb-2">
{locale === 'en' ? '📸 Select Image File' : '📸 Resim Dosyasını Seç'}
                    </div>
                    <div className="text-sm opacity-90">
                      {locale === 'en' ? '✨ AI-Powered Compression' : '✨ Yapay Zeka Destekli Sıkıştırma'}
                    </div>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                </div>

                {/* Hidden FileUpload Component */}
                <FileUpload
                  onFileSelect={(file) => {
                    const selectedFile = Array.isArray(file) ? file[0] : file;
                    handleFileSelect(selectedFile);
                  }}
                  acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic', 'image/heif']}
                  maxSize={10 * 1024 * 1024}
                  multiple={false}
                  title=""
                  description=""
                />

                {/* Orbit Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-dashed border-purple-300 rounded-full animate-spin opacity-30 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-dashed border-pink-300 rounded-full animate-spin opacity-20 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                </div>

                {/* Floating Sparkles */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  {locale === 'en' ? '90% Smaller' : '%90 Daha Küçük'}
                </h3>
                <p className="text-gray-600 text-xs">
                  {locale === 'en' ? 'Maximum compression while preserving quality with AI technology' : 'Yapay zeka teknolojisi ile kaliteyi koruyarak maksimum sıkıştırma'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  {locale === 'en' ? 'AI-Powered' : 'AI Destekli'}
                </h3>
                <p className="text-gray-600 text-xs">
                  {locale === 'en' ? 'Smart algorithms find optimal settings for each image' : 'Akıllı algoritmalar ile her resim için en optimal ayarları bulur'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PhotoIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  {locale === 'en' ? 'Quality Preserved' : 'Kalite Korunur'}
                </h3>
                <p className="text-gray-600 text-xs">
                  {locale === 'en' ? 'Reduces file size while maintaining visual quality at the highest level' : 'Görsel kaliteyi en üst seviyede tutarak dosya boyutunu azaltır'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
{locale === 'en' ? 'Close' : 'Kapat'}
              </button>
            </div>
          </div>
        )}

        {/* HEIC Notification */}
        {heicNotification && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center animate-fade-in">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <p className="text-blue-800 font-medium">{heicNotification}</p>
              </div>
              <p className="text-blue-600 text-sm">
{locale === 'en' ? '🚀 HEIC direct compression feature will be active very soon!' : '🚀 HEIC direkt sıkıştırma özelliği çok yakında aktif olacak!'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: FILE LOADING */}
        {currentStep === 'file-loading' && (
          <div className="py-8 md:py-12 transition-all duration-500 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Step Indicator */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    2
                  </div>
{locale === 'en' ? '📤 Uploading Image...' : '📤 Resim Yükleniyor...'}
                </div>
              </div>

              <div className="text-center">
                {/* Enhanced Loading Animation */}
                <div className="relative mx-auto mb-6 w-32 h-32">
                  {/* Multiple rotating rings */}
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-pink-500 border-r-pink-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-6 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                  
                  {/* Center icon with pulsing effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <PhotoIcon className="h-10 w-10 text-white animate-bounce" />
                    </div>
                  </div>
                  
                  {/* Floating sparkles around the circle */}
                  <div className="absolute top-3 right-6 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-6 left-1/2 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-6 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Loading Text */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
{locale === 'en' ? '📂 Processing File...' : '📂 Dosya İşleniyor...'}
                  </h2>
                  <p className="text-base text-gray-700 mb-2">
                    {selectedFile && isHEICFormat(selectedFile) 
                      ? (locale === 'en' ? '📱 Converting HEIC file...' : '📱 HEIC dosyası dönüştürülüyor...') 
                      : (locale === 'en' ? '🖼️ Preparing image preview...' : '🖼️ Resim önizlemesi hazırlanıyor...')}
                  </p>
                  <p className="text-sm text-gray-500">
{locale === 'en' ? 'This process may take a few seconds' : 'Bu işlem birkaç saniye sürebilir'}
                  </p>
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-purple-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Dots */}
                <div className="flex justify-center space-x-2 mt-8">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                      style={{ 
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIGURE */}
        <div ref={configureRef} className={`py-6 md:py-10 transition-all duration-500 ${
          currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {selectedFile && (
            <div className="max-w-6xl mx-auto px-4">
              
              {/* Step Indicator */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 text-green-800 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    3
                  </div>
                  {locale === 'en' ? '⚙️ Compression Settings' : '⚙️ Sıkıştırma Ayarları'}
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
{locale === 'en' ? '🎯 Quality and Format Selection' : '🎯 Kalite ve Format Seçimi'}
                </h1>
              </div>

              {/* Configure Layout: Preview (Left) + Settings (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* File Preview (1/3) */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2 text-purple-600" />
{locale === 'en' ? '📸 Preview' : '📸 Önizleme'}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* File Preview */}
                      <div className="relative bg-gray-50 rounded-xl p-4 text-center">
                        <div className="w-full h-48 flex items-center justify-center">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-gray-400">
                                <PhotoIcon className="h-16 w-16 mx-auto mb-2" />
                                <p className="text-sm">{locale === 'en' ? 'Loading preview...' : 'Önizleme yükleniyor...'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* File Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{locale === 'en' ? '📄 File:' : '📄 Dosya:'}</span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-32" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{locale === 'en' ? '📊 Size:' : '📊 Boyut:'}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{locale === 'en' ? '🎨 Format:' : '🎨 Format:'}</span>
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {selectedFile.type.split('/')[1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Settings Panel (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Quality Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
{locale === 'en' ? '⚙️ Compression Settings' : '⚙️ Sıkıştırma Ayarları'}
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Quality Slider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
{locale === 'en' ? `🎯 Quality Level: ${Math.round(quality * 100)}%` : `🎯 Kalite Seviyesi: ${Math.round(quality * 100)}%`}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={quality}
                          onChange={(e) => setQuality(parseFloat(e.target.value))}
                          className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                        />
                                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{locale === 'en' ? 'Small file' : 'Küçük dosya'}</span>
                            <span>{locale === 'en' ? 'Balanced' : 'Dengeli'}</span>
                            <span>{locale === 'en' ? 'High quality' : 'Yüksek kalite'}</span>
                          </div>
                      </div>
                      
                      {/* Format Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
{locale === 'en' ? '📄 Output Format' : '📄 Çıktı Formatı'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setFormat(fmt)}
                              className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                                format === fmt
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-medium text-sm uppercase">{fmt}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {fmt === 'jpeg' && (locale === 'en' ? 'Smallest' : 'En küçük')}
                                {fmt === 'png' && (locale === 'en' ? 'Transparency' : 'Şeffaflık')}
                                {fmt === 'webp' && (locale === 'en' ? 'Modern' : 'Modern')}
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {/* HEIC Format Option - Only show for HEIC input files */}
                        {selectedFile && (selectedFile.type === 'image/heic' || selectedFile.type === 'image/heif') && (
                          <div className="mt-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">📱</span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-purple-900">
                                      {locale === 'en' ? 'Keep in HEIC Format?' : 'HEIC Formatında Kalmalı mı?'}
                                    </h4>
                                    <p className="text-sm text-purple-700">
                                      {locale === 'en' ? 'Recommended format for iPhone/iPad photos' : 'iPhone/iPad fotoğrafları için önerilen format'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setFormat('heic')}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    format === 'heic'
                                      ? 'bg-purple-500 text-white shadow-lg'
                                      : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                                  }`}
                                >
{format === 'heic' 
                                    ? (locale === 'en' ? '✓ HEIC Selected' : '✓ HEIC Seçili') 
                                    : (locale === 'en' ? 'Use HEIC' : 'HEIC Kullan')}
                                </button>
                              </div>
                              <div className="mt-3 text-xs text-purple-600">
                                {locale === 'en' 
                                  ? '💡 HEIC format is Apple\'s most efficient compression technology. It provides 50% smaller file size than JPEG at the same quality.' 
                                  : '💡 HEIC format\'ı Apple\'ın en verimli sıkıştırma teknolojisidir. Aynı kalitede JPEG\'den %50 daha küçük dosya boyutu sağlar.'
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Process Button */}
                  <div className="text-center">
                    <button
                      ref={processButtonRef}
                      onClick={handleCompress}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-2xl px-12 py-5 text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-purple-300"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>{locale === 'en' ? 'Compressing...' : 'Sıkıştırılıyor...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                          </div>
                          <span>{locale === 'en' ? '🚀 Start Compression' : '🚀 Sıkıştırmayı Başlat'}</span>
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ArrowLeftIcon className="h-5 w-5 text-white rotate-180" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: PROCESSING */}
        <div ref={processingRef} className={`py-8 md:py-12 transition-all duration-500 ${
          currentStep === 'processing' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {isProcessing && (
            <div className="max-w-2xl mx-auto px-4 text-center">
              
              {/* Step Indicator */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-800 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    4
                  </div>
{locale === 'en' ? '🚀 Compression Process' : '🚀 Sıkıştırma İşlemi'}
                </div>
              </div>

              {/* Processing Animation */}
              <div className="relative mb-8">
                <div className="relative w-32 h-32 mx-auto">
                  {/* Multiple rotating rings */}
                  <div className="absolute inset-0 border-8 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-6 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                      <PhotoIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
{locale === 'en' ? '🤖 AI Compression Process' : '🤖 AI Sıkıştırma İşlemi'}
                </h2>
                <p className="text-gray-700 text-base">
{locale === 'en' ? 'AI is calculating optimal settings...' : 'Yapay zeka en optimal ayarları hesaplıyor...'}
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{locale === 'en' ? 'Progress' : 'İlerleme'}</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${processingProgress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Processing Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 0 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 0 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 0 ? '✓' : '1'}
                  </div>
                  <span className="font-medium">{locale === 'en' ? 'Analyzing image' : 'Resim analiz ediliyor'}</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 30 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 30 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 30 ? '✓' : '2'}
                  </div>
                  <span className="font-medium">{locale === 'en' ? 'Calculating optimal settings' : 'Optimal ayarlar hesaplanıyor'}</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 60 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 60 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 60 ? '✓' : '3'}
                  </div>
                  <span className="font-medium">{locale === 'en' ? 'Applying compression' : 'Sıkıştırma uygulanıyor'}</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 90 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 90 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 90 ? '✓' : '4'}
                  </div>
                  <span className="font-medium">{locale === 'en' ? 'Preparing result' : 'Sonuç hazırlanıyor'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 5: RESULT */}
        <div ref={resultRef} className={`py-8 md:py-12 transition-all duration-500 ${
          currentStep === 'result' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {compressionResult && (
            <div className="max-w-4xl mx-auto px-4">
              
              {/* Step Indicator */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    5
                  </div>
{locale === 'en' ? '🎉 Compression Complete' : '🎉 Sıkıştırma Tamamlandı'}
                </div>
              </div>

              {/* Success Header */}
              <div className="text-center mb-8">
                {/* Success Animation */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircleIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 border-4 border-green-300 rounded-full animate-ping opacity-40"></div>
                  <div className="absolute -inset-2 border-2 border-green-200 rounded-full animate-pulse opacity-30"></div>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
{locale === 'en' ? '✅ Success!' : '✅ İşlem Başarılı!'}
                </h2>
                
                {/* Compression Stats */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-6xl font-bold text-green-600">
                      {Math.round(compressionResult.compressionRatio)}%
                    </div>
                  </div>
                  <p className="text-green-800 font-medium text-lg">
{locale === 'en' 
                      ? `📉 File size reduced: ${formatFileSize(compressionResult.originalSize - compressionResult.compressedSize)} saved`
                      : `📉 Dosya boyutu azaldı: ${formatFileSize(compressionResult.originalSize - compressionResult.compressedSize)} tasarruf`
                    }
                  </p>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
{locale === 'en' ? '📤 Original Image' : '📤 Orijinal Resim'}
                  </h3>
                  <div className="space-y-4">
                    {/* Original Image Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-full h-32 flex items-center justify-center">
                        <img
                          src={previewUrl || ''}
                          alt="Original"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {formatFileSize(compressionResult.originalSize)}
                      </div>
                      <div className="text-sm text-red-700">{locale === 'en' ? 'File Size' : 'Dosya Boyutu'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
{locale === 'en' ? '📥 Compressed Image' : '📥 Sıkıştırılmış Resim'}
                  </h3>
                  <div className="space-y-4">
                    {/* Compressed Image Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-full h-32 flex items-center justify-center">
                        <img
                          src={compressionResult.downloadUrl}
                          alt="Compressed"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatFileSize(compressionResult.compressedSize)}
                      </div>
                      <div className="text-sm text-green-700">{locale === 'en' ? 'New Size' : 'Yeni Boyut'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center mb-8">
                <a
                  href={compressionResult.downloadUrl}
                  download={`compressed_${compressionResult.originalFile?.name || 'image'}`}
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/30 transform hover:scale-105"
                >
                  <CloudArrowUpIcon className="h-6 w-6 mr-3" />
{locale === 'en' ? '🎉 Download Compressed Image' : '🎉 Sıkıştırılmış Resmi İndir'}
                </a>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-purple-600 hover:text-purple-800 font-medium text-lg underline"
                >
{locale === 'en' ? '🔄 Compress New Image' : '🔄 Yeni Resim Sıkıştır'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 