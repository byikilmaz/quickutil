'use client';
import { useState, useRef, useEffect } from 'react';
import { PhotoIcon, SparklesIcon, ArrowPathIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  convertImage, 
  getImageDimensions, 
  validateImageFile, 
  formatFileSize,
  type ConversionResult,
  type ConversionOptions 
} from '@/lib/imageUtils';

interface ConvertResult {
  originalFile: File;
  convertedBlob: Blob;
  originalSize: number;
  convertedSize: number;
  downloadUrl: string;
  format: string;
}

export default function ImageConvert() {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Component state - Step-based
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

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
      }, 500);
    }
  }, [currentStep]);

  // File selection handler
  const handleFileSelect = async (file: File) => {
    if (!canUseFeature('image_convert')) {
      setShowAuthModal(true);
      return;
    }

    if (!validateImageFile(file)) {
      setError('Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, WebP)');
      return;
    }

    setSelectedFile(file);
    setCurrentStep('configure');
    setError(null);

    // Get original dimensions
    try {
      const dimensions = await getImageDimensions(file);
      setOriginalDimensions(dimensions);
    } catch (err) {
      console.error('Error getting image dimensions:', err);
    }
    
    // Smooth scroll to configure section
    setTimeout(() => {
      configureRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    // Then scroll to process button
    setTimeout(() => {
      processButtonRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 600);
  };

  // Convert handler
  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Smooth scroll to processing section
    setTimeout(() => {
      processingRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    const startTime = Date.now();

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const options: ConversionOptions = {
        format,
        quality,
        maxWidth,
        maxHeight,
      };

      const result = await convertImage(selectedFile, options);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Create result
      const downloadUrl = URL.createObjectURL(result.file);

      const convertRes: ConvertResult = {
        originalFile: selectedFile,
        convertedBlob: result.file,
        originalSize: selectedFile.size,
        convertedSize: result.file.size,
        downloadUrl,
        format: format.toUpperCase()
      };

      setConvertResult(convertRes);
      setCurrentStep('result');
      setIsProcessing(false);

      // Track activity if user is logged in
      if (user) {
        try {
          const processingTime = Date.now() - startTime;

          await ActivityTracker.createActivity(user.uid, {
            type: 'image_convert',
            fileName: selectedFile.name,
            originalFileName: selectedFile.name,
            fileSize: selectedFile.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime
          });
        } catch (activityError) {
          console.error('Activity tracking error:', activityError);
        }
      }

      // Smooth scroll to result section
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dönüştürme sırasında hata oluştu');
      setIsProcessing(false);
      setCurrentStep('configure');
      console.error('Image conversion error:', err);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!convertResult) return;

    const a = document.createElement('a');
    a.href = convertResult.downloadUrl;
    a.download = `converted_${selectedFile?.name?.replace(/\.[^/.]+$/, '')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reset handler
  const handleReset = () => {
    setSelectedFile(null);
    setConvertResult(null);
    setCurrentStep('upload');
    setIsProcessing(false);
    setProcessingProgress(0);
    setError(null);
    setFormat('jpeg');
    setQuality(0.9);
    setMaxWidth(undefined);
    setMaxHeight(undefined);
    setOriginalDimensions(null);
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
        <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* AI Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                <SparklesIcon className="h-4 w-4 mr-2 text-purple-600 animate-pulse" />
                ✨ 5M+ Format Dönüştürme • AI Destekli
              </div>
            </div>

            {/* Enhanced Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-4">
                🔄 Resim Format Dönüştürme
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                PNG, JPEG ve WebP formatları arasında kaliteli dönüştürme yapın
              </p>
            </div>

            {/* Enhanced Upload Button */}
            <div className="max-w-md mx-auto text-center">
              <div className="relative group cursor-pointer">
                {/* Main Upload Button */}
                <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-3xl px-12 py-8 text-xl font-bold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 flex flex-col items-center justify-center transform hover:scale-105 group-hover:rotate-1">
                  
                  {/* Animated Upload Icon */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ArrowPathIcon className="h-8 w-8 text-white group-hover:animate-spin" />
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
                      📸 Resim Dosyasını Seç
                    </div>
                    <div className="text-sm opacity-90">
                      🔄 Format Dönüştürme için
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
                  acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                  maxSize={50 * 1024 * 1024}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ArrowPathIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Çoklu Format</h3>
                <p className="text-gray-600 text-sm">PNG, JPEG ve WebP formatları arasında hızlı dönüştürme</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kalite Korunur</h3>
                <p className="text-gray-600 text-sm">Görsel kaliteyi koruyarak format değişimi</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PhotoIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Anında İşlem</h3>
                <p className="text-gray-600 text-sm">Browser'da hızlı dönüştürme, upload gerektirmez</p>
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
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURE */}
        <div ref={configureRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {selectedFile && (
            <div className="max-w-6xl mx-auto px-4">
              
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  🎯 Dönüştürme Ayarları
                </h1>
              </div>

              {/* Configure Layout: Preview (Left) + Settings (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* File Preview (1/3) */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2 text-purple-600" />
                      📸 Önizleme
                    </h3>
                    
                    <div className="space-y-4">
                      {/* File Preview */}
                      <div className="relative bg-gray-50 rounded-xl p-4 text-center">
                        <Image
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm object-contain"
                          unoptimized
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">📄 Dosya:</span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-32" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">📊 Boyut:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">🎨 Format:</span>
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {selectedFile.type.split('/')[1]}
                          </span>
                        </div>
                        {originalDimensions && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">📐 Boyutlar:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {originalDimensions.width} × {originalDimensions.height}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Settings Panel (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Format Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <ArrowPathIcon className="h-5 w-5 mr-2 text-purple-600" />
                      🔄 Dönüştürme Ayarları
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Format Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          📄 Hedef Format
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
                                {fmt === 'jpeg' && 'En uyumlu'}
                                {fmt === 'png' && 'Şeffaflık'}
                                {fmt === 'webp' && 'Modern'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quality Slider (JPEG/WebP only) */}
                      {format !== 'png' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            🎯 Kalite Seviyesi: {Math.round(quality * 100)}%
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
                            <span>Küçük dosya</span>
                            <span>Dengeli</span>
                            <span>Yüksek kalite</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📐 Maks. Genişlik (px)
                          </label>
                          <input
                            type="number"
                            value={maxWidth || ''}
                            onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Orijinal"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📐 Maks. Yükseklik (px)
                          </label>
                          <input
                            type="number"
                            value={maxHeight || ''}
                            onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Orijinal"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Process Button */}
                  <div className="text-center">
                    <button
                      ref={processButtonRef}
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white rounded-2xl px-12 py-5 text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-purple-300"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Dönüştürülüyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ArrowPathIcon className="h-5 w-5 text-white animate-pulse" />
                          </div>
                          <span>🔄 Dönüştürmeyi Başlat</span>
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

        {/* STEP 3: PROCESSING */}
        <div ref={processingRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'processing' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {isProcessing && (
            <div className="max-w-2xl mx-auto px-4 text-center">
              
              {/* Processing Animation */}
              <div className="relative mb-12">
                <div className="relative w-32 h-32 mx-auto">
                  {/* Multiple rotating rings */}
                  <div className="absolute inset-0 border-8 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-6 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                      <ArrowPathIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  🔄 Format Dönüştürme İşlemi
                </h2>
                <p className="text-gray-600 text-lg">
                  Resminizi {format.toUpperCase()} formatına dönüştürüyoruz...
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>İlerleme</span>
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
                {[
                  { text: '📸 Resim dosyası analiz ediliyor...', delay: 0 },
                  { text: '🔄 Format dönüştürme işlemi başlatılıyor...', delay: 1000 },
                  { text: '⚙️ Kalite ayarları uygulanıyor...', delay: 2000 },
                  { text: '✨ Son işlemler tamamlanıyor...', delay: 2500 }
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      processingProgress > (index + 1) * 25 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      processingProgress > (index + 1) * 25 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {processingProgress > (index + 1) * 25 ? '✓' : index + 1}
                    </div>
                    <span className="text-sm font-medium">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: RESULT */}
        <div ref={resultRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'result' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {convertResult && (
            <div className="max-w-4xl mx-auto px-4">
              
              {/* Success Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 animate-bounce-in">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  🎉 Dönüştürme Tamamlandı!
                </h1>
                <p className="text-xl text-gray-600">
                  Resminiz başarıyla {convertResult.format} formatına dönüştürüldü
                </p>
              </div>

              {/* Result Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Original File */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <PhotoIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Orijinal</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {formatFileSize(convertResult.originalSize)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedFile?.type.split('/')[1].toUpperCase()} Formatı
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                    <ArrowPathIcon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Converted File */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Dönüştürülmüş</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatFileSize(convertResult.convertedSize)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {convertResult.format} Formatı
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center mb-12">
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white rounded-2xl px-12 py-5 text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/30 flex items-center justify-center mx-auto transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <CloudArrowUpIcon className="h-5 w-5 text-white rotate-180" />
                    </div>
                    <span>💾 Dönüştürülmüş Resmi İndir</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl px-8 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-gray-500/30 flex items-center justify-center mx-auto"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  🔄 Yeni Dönüştürme
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Other Tools Section */}
        {currentStep === 'result' && (
          <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  🛠️ Diğer Resim Araçları
                </h2>
                <p className="text-gray-600">Resimlerinizi daha da güzelleştirin</p>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { href: '/image-compress', icon: '🗜️', title: 'Sıkıştır' },
                  { href: '/image-resize', icon: '📐', title: 'Boyutlandır' },
                  { href: '/image-crop', icon: '✂️', title: 'Kırp' },
                  { href: '/image-rotate', icon: '🔄', title: 'Döndür' },
                  { href: '/image-filters', icon: '🎨', title: 'Filtreler' },
                  { href: '/pdf-convert', icon: '📄', title: 'PDF Dönüştür' }
                ].map((tool, index) => (
                  <a
                    key={index}
                    href={tool.href}
                    className="group bg-white rounded-2xl p-2 text-center hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-300 hover:scale-110"
                  >
                    <div className="w-8 h-8 mx-auto mb-1 text-lg">
                      {tool.icon}
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-purple-600">
                      {tool.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 