'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import { 
  ArrowDownTrayIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import JSZip from 'jszip';

interface ConversionResult {
  name: string;
  url: string;
  size: number;
  type: string;
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
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2.0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  // Auto-scroll to current step
  useEffect(() => {
    const scrollToStep = () => {
      let targetRef;
      switch (currentStep) {
        case 'upload':
          targetRef = uploadRef;
          break;
        case 'configure':
          targetRef = configureRef;
          break;
        case 'processing':
          targetRef = processingRef;
          break;
        case 'result':
          targetRef = resultRef;
          break;
      }
      
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    };
    
    const timer = setTimeout(scrollToStep, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Check feature access on mount
  useEffect(() => {
    canUseFeature('pdf_to_images');
  }, [canUseFeature]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    setError(null);
    
    if (file.size > 20 * 1024 * 1024) {
      setError(getText('errors.pdfToImages.fileSizeLimit', 'Dosya boyutu 20MB\'dan büyük olamaz.'));
      return;
    }
    
    setSelectedFile(file);
    setCurrentStep('configure');
  };

  // Get localized text
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  // Handle conversion (placeholder implementation)
  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    setError(null);
    setCurrentStep('processing');
    setConversionProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 400);

      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      // Mock conversion results
      const mockResults: ConversionResult[] = Array.from({ length: 3 }, (_, i) => ({
        name: `page_${i + 1}.${format}`,
        url: URL.createObjectURL(selectedFile), // Mock URL
        size: Math.floor(Math.random() * 500000) + 100000,
        type: `image/${format}`
      }));
      
      setConversionResults(mockResults);
      setCurrentStep('result');
      
      if (user) {
        // Track analytics
        console.log('Conversion completed');
      }
      
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(getText('errors.pdfToImages.conversionFailed', 'Dönüştürme sırasında hata oluştu.'));
      setCurrentStep('configure');
      setConversionProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  // Handle download all as ZIP
  const handleDownloadAll = async () => {
    if (conversionResults.length === 0) return;
    
    if (conversionResults.length === 1) {
      // Single file - direct download
      const link = document.createElement('a');
      link.href = conversionResults[0].url;
      link.download = conversionResults[0].name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Multiple files - ZIP download
    setIsDownloadingAll(true);
    
    try {
      const zip = new JSZip();
      
      for (const result of conversionResults) {
        const response = await fetch(result.url);
        const blob = await response.blob();
        zip.file(result.name, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `converted_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('ZIP creation error:', error);
      setError(getText('errors.pdfToImages.zipCreationFailed', 'ZIP dosyası oluşturulurken hata oluştu.'));
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setConversionResults([]);
    setError(null);
    setConversionProgress(0);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
        currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <div className="mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              {getText('pdfToImages.title', 'PDF to Images')}
            </h1>
            <p className="text-xl text-gray-800">
              {getText('pdfToImages.subtitle', 'PDF\'i yüksek kaliteli JPG/PNG görsellerine dönüştürün')}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <PhotoIcon className="h-5 w-5 mr-2" />
                {getText('pdfConvert.fileUpload', 'PDF dosyasını seç')}
              </div>
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
                title={getText('pdfToImages.selectFile', 'PDF Dosyasını Seçin')}
                description={getText('pdfToImages.selectDescription', 'Resimlere dönüştürmek istediğiniz PDF dosyasını seçin')}
                locale={locale}
                texts={{
                  selectFiles: getText('pdfToImages.selectFiles', 'PDF Dosyalarını Seç'),
                  selectFile: getText('pdfToImages.selectFile', 'PDF Dosyasını Seç'),
                  dragDrop: getText('pdfToImages.dragDrop', 'PDF dosyasını buraya sürükleyin'),
                  maxSize: getText('common.maxSize', 'Maks. Boyut'),
                  supportedFormats: getText('common.supportedFormats', 'Desteklenen Format'),
                  maxFiles: getText('common.maxFiles', 'Maks. Dosya'),
                  securityNotice: getText('common.securityNotice', 'Dosyalarınız güvenle işlenir'),
                  fileUploaded: getText('common.fileUploaded', 'Dosya Yüklendi!'),
                  readyToProcess: getText('common.readyToProcess', 'işleme hazır'),
                  fileReady: getText('common.fileReady', 'Dosya hazır'),
                  size: getText('common.size', 'Boyut'),
                  fileRequirements: getText('common.fileRequirements', 'Dosya Gereksinimleri'),
                  uploadFailed: getText('common.uploadFailed', 'Yükleme başarısız'),
                  or: getText('common.or', 'veya')
                }}
              />
            </div>
            
            <p className="text-sm text-gray-800 mt-4">
              {getText('pdfConvert.selectOrDrag', 'veya PDF\'i buraya bırak')}
            </p>
          </div>

          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: CONFIGURE */}
      <div ref={configureRef} className={`py-8 min-h-screen transition-all duration-500 ${
        currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        {selectedFile && (
          <div className="max-w-6xl mx-auto px-4">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {getText('pdfToImages.selectFormat', 'Format ve Kalite Ayarları')}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* File Preview */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-blue-200 p-6 sticky top-8">
                  
                  <div className="relative mx-auto w-32 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <DocumentIcon className="h-16 w-16 text-blue-600" />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      1
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm truncate">
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-gray-700 mb-4">
                      {formatFileSize(selectedFile.size)}
                    </p>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center justify-center mx-auto transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      {getText('pdfCompress.remove.file', 'Dosyayı kaldır')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  
                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {getText('pdfToImages.selectFormat', 'Çıktı Formatı')}
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setFormat('png')}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          format === 'png'
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">PNG</div>
                            <div className="text-sm text-gray-700">{getText('pdfToImages.formatPng', 'Şeffaflık destekli, yüksek kalite')}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            format === 'png' 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500' 
                              : 'border-gray-300'
                          }`}>
                            {format === 'png' && (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setFormat('jpeg')}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          format === 'jpeg'
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">JPEG</div>
                            <div className="text-sm text-gray-700">{getText('pdfToImages.formatJpeg', 'Küçük dosya boyutu, hızlı indirme')}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            format === 'jpeg' 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500' 
                              : 'border-gray-300'
                          }`}>
                            {format === 'jpeg' && (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Quality Setting for JPEG */}
                  {format === 'jpeg' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        {getText('pdfToImages.quality', 'Kalite')}: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Düşük</span>
                        <span>Yüksek</span>
                      </div>
                    </div>
                  )}

                  {/* Scale Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {getText('pdfToImages.scale', 'Çözünürlük')}: {scale}x
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setScale(1.0)}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                          scale === 1.0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-sm font-medium">1x - Standart</div>
                      </button>
                      <button
                        onClick={() => setScale(2.0)}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                          scale === 2.0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-sm font-medium">2x - {getText('pdfToImages.highQuality', 'Yüksek Kalite')}</div>
                      </button>
                      <button
                        onClick={() => setScale(3.0)}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                          scale === 3.0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-sm font-medium">3x - Ultra HD</div>
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-center">{error}</p>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={handleConvert}
                    disabled={!selectedFile || isConverting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    {getText('pdfConvert.startConversion', 'Dönüştürmeyi Başlat')}
                    <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PROCESSING */}
      <div ref={processingRef} className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'processing' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-blue-200">
            
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center animate-pulse">
                <PhotoIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {getText('pdfToImages.converting', 'PDF görsellere dönüştürülüyor...')}
            </h2>
            <p className="text-gray-800 mb-6">
              {getText('pdfToImages.aiOptimization', 'Yüksek kaliteli görsel çıktısı hazırlanıyor')}
            </p>

            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">
                {selectedFile?.name} - {conversionProgress}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: RESULT */}
      <div ref={resultRef} className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'result' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {conversionResults.length > 0 && (
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-blue-200">
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {getText('pdfToImages.completed', 'Görsel Dönüştürme Tamamlandı!')}
                </h2>
              </div>

              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">
                        {conversionResults.length}
                      </div>
                      <div className="text-xs uppercase tracking-wide">
                        {getText('pdfToImages.totalImages', 'Görsel')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-medium">Format:</span> {format.toUpperCase()}
                  </p>
                  <p>
                    <span className="font-medium">Çözünürlük:</span> {scale}x
                  </p>
                </div>
              </div>

              {/* Other Tools Suggestions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
                  {getText('pdfCompress.otherTools', 'Şu araca geçiş yap:')}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-compress" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.pdfCompress', 'PDF sıkıştır')}
                    </span>
                  </Link>

                  <Link
                    href="/image-convert"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageFormat', 'Resim dönüştür')}
                    </span>
                  </Link>

                  <Link
                    href="/image-compress"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ArrowDownTrayIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageCompress', 'Resim sıkıştır')}
                    </span>
                  </Link>

                  <Link
                    href="/image-crop"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageCrop', 'Resim kırp')}
                    </span>
                  </Link>

                  <Link
                    href="/image-resize"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageResize', 'Resim boyutlandır')}
                    </span>
                  </Link>

                  <Link
                    href="/image-rotate"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ArrowLeftIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageRotate', 'Resim döndür')}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {isDownloadingAll ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {getText('pdfConvert.downloadPreparingZip', 'ZIP Hazırlanıyor...')}
                    </div>
                  ) : (
                    conversionResults.length > 1 ? getText('pdfConvert.downloadAll', 'Tümünü İndir (ZIP)') : getText('pdfConvert.downloadAllSingle', 'Dosyayı İndir')
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-300 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  {getText('pdfConvert.newConversion', 'Yeni Dönüştürme')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 