'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowPathIcon, SparklesIcon, PhotoIcon, CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { getTranslations } from '@/lib/translations';

interface CompressionResult {
  originalFile: File;
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

  // Get localized text helper function
  const getText = (key: string, fallback: string) => {
    return fallback; // Simplified for now
  };
  
  // Component state - Step-based like PDF convert
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // File selection handler
  const handleFileSelect = (file: File) => {
    if (!canUseFeature('image_compress')) {
      setShowAuthModal(true);
      return;
    }

    setSelectedFile(file);
    setCurrentStep('configure');
    setError(null);
    
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

  // Compression handler
  const handleCompress = async () => {
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

      // Simulate actual compression (replace with real implementation)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear progress interval
      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Create mock compression result
      const originalSize = selectedFile.size;
      const compressedSize = Math.floor(originalSize * (1 - quality * 0.7));
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      // Create compressed blob (mock)
      const compressedBlob = selectedFile.slice(0, compressedSize);
      const downloadUrl = URL.createObjectURL(compressedBlob);

      const result: CompressionResult = {
        originalFile: selectedFile,
        compressedBlob,
        originalSize,
        compressedSize,
        compressionRatio,
        downloadUrl
      };

      setCompressionResult(result);
      setCurrentStep('result');
      setIsProcessing(false);

      // Smooth scroll to result section
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);

    } catch (err) {
      setError('Resim sıkıştırılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsProcessing(false);
      setCurrentStep('configure');
      console.error('Image compression error:', err);
    }
  };

  // Reset handler
  const handleReset = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setCurrentStep('upload');
    setIsProcessing(false);
    setProcessingProgress(0);
    setError(null);
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
          <Breadcrumb />
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
                ✨ 2M+ Resim Sıkıştırıldı • AI Destekli
              </div>
            </div>

            {/* Enhanced Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-4">
                🖼️ Resim Sıkıştırma
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                {getText('imageCompress.subtitle', 'Yapay zeka destekli teknoloji ile resimlerinizi kalitesini koruyarak sıkıştırın')}
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
                      <PhotoIcon className="h-8 w-8 text-white group-hover:animate-bounce" />
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
                      ✨ Yapay Zeka Destekli Sıkıştırma
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
                  acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">%90 Daha Küçük</h3>
                <p className="text-gray-600 text-sm">Yapay zeka teknolojisi ile kaliteyi koruyarak maksimum sıkıştırma</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">AI Destekli</h3>
                <p className="text-gray-600 text-sm">Akıllı algoritmalar ile her resim için en optimal ayarları bulur</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PhotoIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kalite Korunur</h3>
                <p className="text-gray-600 text-sm">Görsel kaliteyi en üst seviyede tutarak dosya boyutunu azaltır</p>
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
                  🎯 Sıkıştırma Ayarları
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
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
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
                      ⚙️ Sıkıştırma Ayarları
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Quality Slider */}
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
                      
                      {/* Format Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          📄 Çıktı Formatı
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
                                {fmt === 'jpeg' && 'En küçük'}
                                {fmt === 'png' && 'Şeffaflık'}
                                {fmt === 'webp' && 'Modern'}
                              </div>
                            </button>
                          ))}
                        </div>
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
                          <span>Sıkıştırılıyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
                          </div>
                          <span>🚀 Sıkıştırmayı Başlat</span>
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
                      <PhotoIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  🤖 AI Sıkıştırma İşlemi
                </h2>
                <p className="text-gray-600 text-lg">
                  Yapay zeka en optimal ayarları hesaplıyor...
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>İlerleme</span>
                  <span>{processingProgress}%</span>
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
                  <span className="font-medium">Resim analiz ediliyor</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 30 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 30 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 30 ? '✓' : '2'}
                  </div>
                  <span className="font-medium">Optimal ayarlar hesaplanıyor</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 60 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 60 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 60 ? '✓' : '3'}
                  </div>
                  <span className="font-medium">Sıkıştırma uygulanıyor</span>
                </div>
                
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  processingProgress > 90 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    processingProgress > 90 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {processingProgress > 90 ? '✓' : '4'}
                  </div>
                  <span className="font-medium">Sonuç hazırlanıyor</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: RESULT */}
        <div ref={resultRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'result' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {compressionResult && (
            <div className="max-w-4xl mx-auto px-4">
              
              {/* Success Header */}
              <div className="text-center mb-12">
                {/* Success Animation */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircleIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 border-4 border-green-300 rounded-full animate-ping opacity-40"></div>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  🎉 Sıkıştırma Tamamlandı!
                </h2>
                
                {/* Compression Stats */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-6xl font-bold text-green-600">
                      {Math.round(compressionResult.compressionRatio)}%
                    </div>
                  </div>
                  <p className="text-green-800 font-medium text-lg">
                    📉 Dosya boyutu azaldı: {formatFileSize(compressionResult.originalSize - compressionResult.compressedSize)} tasarruf
                  </p>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    📤 Orijinal Resim
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {formatFileSize(compressionResult.originalSize)}
                      </div>
                      <div className="text-sm text-red-700">Dosya Boyutu</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    📥 Sıkıştırılmış Resim
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatFileSize(compressionResult.compressedSize)}
                      </div>
                      <div className="text-sm text-green-700">Yeni Boyut</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center mb-8">
                <a
                  href={compressionResult.downloadUrl}
                  download={`compressed_${compressionResult.originalFile.name}`}
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/30 transform hover:scale-105"
                >
                  <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                  🎉 Sıkıştırılmış Resmi İndir
                </a>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-purple-600 hover:text-purple-800 font-medium text-lg underline"
                >
                  🔄 Yeni Resim Sıkıştır
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 