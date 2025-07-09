'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  ArrowDownTrayIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  PhotoIcon,
  DocumentTextIcon,
  ScissorsIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { convertPDFToImages, ConversionResult } from '@/lib/pdfConvertUtils';

interface ConversionResultDisplay {
  results: ConversionResult[];
  totalSize: number;
  convertedCount: number;
  processingTime: number;
  downloadUrls: { name: string; url: string; size: number }[];
}

// Server wrapper component to handle async params
export default async function PDFToImagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFToImages locale={locale} />;
}

// Client component with direct locale prop
function PDFToImages({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(0.9);
  const [scale, setScale] = useState<number>(2.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    const refs = {
      upload: uploadRef,
      configure: configureRef,
      processing: processingRef,
      result: resultRef
    };
    
    const targetRef = refs[currentStep];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!canUseFeature('pdf_convert')) {
      setError('Günlük PDF dönüştürme limitiniz doldu. Lütfen yarın tekrar deneyin.');
      return;
    }

    // File size validation (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setError('Dosya boyutu 20MB\'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setCurrentStep('configure');
  };

  // Process conversion
  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing steps
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    const startTime = Date.now();

    try {
      const results = await convertPDFToImages(selectedFile, selectedFormat, quality, scale);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Calculate results
      const totalProcessedSize = results.reduce((total, result) => total + result.size, 0);
      const processingTime = Date.now() - startTime;

      setConversionResult({
        results,
        totalSize: totalProcessedSize,
        convertedCount: results.length,
        processingTime,
        downloadUrls: results.map(r => ({ name: r.name, url: r.url, size: r.size }))
      });

      // Upload to storage if user is logged in
      if (user && results.length > 0) {
        try {
          // Convert first result to File for upload
          const response = await fetch(results[0].url);
          const blob = await response.blob();
          const file = new File([blob], results[0].name, { type: results[0].type });
          await uploadFile(file, 'image');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }

      setCurrentStep('result');

    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Dönüştürme sırasında hata oluştu');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setConversionResult(null);
    setError(null);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <StructuredData 
        page="pdf-to-images"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-6">
                <PhotoIcon className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                PDF to Images
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                PDF sayfalarınızı yüksek kaliteli PNG veya JPG formatına dönüştürün
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-16 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
                  <FileUpload
                    onFileSelect={(file) => {
                      if (Array.isArray(file)) {
                        handleFileSelect(file[0]);
                      } else {
                        handleFileSelect(file);
                      }
                    }}
                    acceptedTypes={['application/pdf']}
                    maxSize={20 * 1024 * 1024}
                    title=""
                    description=""
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <CloudArrowUpIcon className="h-16 w-16 text-blue-500 mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      PDF dosyasını seç veya sürükle
                    </p>
                    <p className="text-gray-500">
                      Maksimum 20MB • Yüksek kaliteli resim çıktısı
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 'configure' && selectedFile && (
          <div ref={configureRef} className="min-h-screen flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* File Info - Left Side */}
              <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 h-fit">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
                    <PhotoIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to Images</h2>
                  <p className="text-gray-600">Yüksek kaliteli resim dönüştürme</p>
                </div>

                {/* Selected File */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Yapay zeka destekli dönüştürme</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Yüksek çözünürlük desteği</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Kalite optimizasyonu</span>
                  </div>
                </div>
              </div>

              {/* Settings - Right Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Dönüştürme Ayarları</h3>
                  
                  {/* Format Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Çıktı Formatı</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedFormat('png')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedFormat === 'png'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🖼️</div>
                          <div className="font-semibold text-gray-900">PNG</div>
                          <div className="text-sm text-gray-600">Yüksek kalite, şeffaflık</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedFormat('jpeg')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedFormat === 'jpeg'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📷</div>
                          <div className="font-semibold text-gray-900">JPEG</div>
                          <div className="text-sm text-gray-600">Küçük dosya boyutu</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Quality Setting */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Kalite: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Küçük dosya</span>
                      <span>En yüksek kalite</span>
                    </div>
                  </div>

                  {/* Scale Setting */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Çözünürlük: {scale}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.5"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1x (Standart)</span>
                      <span>3x (Ultra HD)</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConvert}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      ✨ Resimlere Dönüştür
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-6 py-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <div ref={processingRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center max-w-md mx-auto">
              
              {/* Processing Animation */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-blue-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Processing Text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                PDF resimlere dönüştürülüyor...
              </h2>
              <p className="text-gray-600 mb-8">
                Yapay zeka algoritmalarımız her sayfayı işliyor
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">%{processingProgress} tamamlandı</p>

              {/* Processing Steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  '📄 PDF sayfaları analiz ediliyor...',
                  '🎨 Resim kalitesi optimize ediliyor...',
                  '⚡ Yüksek çözünürlük uygulanıyor...'
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 'result' && conversionResult && (
          <div ref={resultRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center max-w-2xl mx-auto">
              
              {/* Success Animation */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Dönüştürme Tamamlandı! 🎉
                </h2>
                <p className="text-gray-600">
                  {conversionResult.convertedCount} resim başarıyla oluşturuldu
                </p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{conversionResult.convertedCount}</div>
                  <div className="text-sm text-gray-600">Oluşturulan Resim</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {(conversionResult.totalSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-600">Toplam Boyut</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 md:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedFormat.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Format</div>
                </div>
              </div>

              {/* Download Files */}
              <div className="space-y-4 mb-8">
                {conversionResult.downloadUrls.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download={file.name}
                    className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <PhotoIcon className="h-8 w-8 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <ArrowDownTrayIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                  </a>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Yeni Dönüştürme
                </button>
                <Link
                  href="/pdf-convert"
                  className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Diğer Araçlar
                </Link>
              </div>

              {/* Other Tools Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
                  Şu araca geçiş yap:
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-compress" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Sıkıştır</span>
                  </Link>
                  
                  <Link
                    href="/pdf-to-text" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF to Text</span>
                  </Link>

                  <Link
                    href="/pdf-split" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <ScissorsIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Ayır</span>
                  </Link>

                  <Link
                    href="/pdf-merge" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <Square2StackIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Birleştir</span>
                  </Link>

                  <Link
                    href="/image-compress" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Sıkıştır</span>
                  </Link>

                  <Link
                    href="/image-resize" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim Boyutlandır</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50">
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 