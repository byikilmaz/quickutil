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
  TrashIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';

interface CompressionResultDisplay {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  downloadUrl: string;
}

// formatFileSize utility function
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Server wrapper component to handle async params
export default async function PDFCompressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFCompress locale={locale} />;
}

// Client component with direct locale prop
function PDFCompress({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Remove async translations loading since we get it from server
  // const [t, setT] = useState<any>({});
  // useEffect(() => {
  //   const loadTranslations = async () => {
  //     const translations = await getTranslations(params.locale);
  //     setT(translations);
  //   };
  //   loadTranslations();
  // }, [params.locale]);
  
  // Render.com integration hooks
  // const { isHealthy, healthData, compressPDF: compressWithRender } = useRenderCompression();
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState('ebook'); // Default to recommended

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
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToStep, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Check feature access on mount
  useEffect(() => {
    canUseFeature('pdf_compress');
  }, [canUseFeature]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    setError(null);
    
    // File size limit
    if (file.size > 20 * 1024 * 1024) {
      setError('Dosya boyutu 20MB\'dan büyük olamaz.');
      return;
    }
    
    setSelectedFile(file);
    setCurrentStep('configure');
  };

  // Handle compression
  const handleCompress = async () => {
    if (!selectedFile) return;
    
    setIsCompressing(true);
    setError(null);
    setCurrentStep('processing');
    
    try {
      // const result = await compressWithRender(selectedFile, quality);
      
      // if (result.success && result.data) {
      //   const downloadUrl = URL.createObjectURL(result.data);
      
      //   const compressionResultData: CompressionResultDisplay = {
      //     compressedBlob: result.data,
      //     originalSize: result.originalSize || selectedFile.size,
      //     compressedSize: result.compressedSize || result.data.size,
      //     compressionRatio: result.compressionRatio || 0,
      //     processingTime: result.processingTime || 0,
      //     downloadUrl
      //   };
      
      //   setCompressionResult(compressionResultData);
      //   setCurrentStep('result');
      
      //   // Track analytics
      //   if (user) {
      //     const compressedFile = new File([result.data], `compressed_${selectedFile.name}`, {
      //       type: 'application/pdf',
      //       lastModified: Date.now()
      //     });
      //     await uploadFile(compressedFile, 'pdf');
      //   }
      // } else {
      //   throw new Error(result.error || 'Sıkıştırma başarısız oldu');
      // }
      // Placeholder for compression logic
      console.log('Compressing file:', selectedFile.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate compression

      const downloadUrl = URL.createObjectURL(selectedFile!); // Simulate compressed file

      const compressionResultData: CompressionResultDisplay = {
        compressedBlob: selectedFile!,
        originalSize: selectedFile!.size,
        compressedSize: selectedFile!.size, // Simulate compressed size
        compressionRatio: 0, // No compression ratio available
        processingTime: 0, // Simulate processing time
        downloadUrl
      };

      setCompressionResult(compressionResultData);
      setCurrentStep('result');

      // Track analytics
      if (user) {
        const compressedFile = new File([selectedFile!], `compressed_${selectedFile!.name}`, {
          type: 'application/pdf',
          lastModified: Date.now()
        });
        await uploadFile(compressedFile, 'pdf');
      }

    } catch (err: any) {
      console.error('Compression error:', err);
      let errorMessage = err.message || 'Sıkıştırma sırasında hata oluştu';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('too large')) {
        errorMessage = 'Dosya çok büyük veya karmaşık. Lütfen tekrar deneyin.';
      }
      
      setError(errorMessage);
      setCurrentStep('configure');
    } finally {
      setIsCompressing(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setCompressionResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb />
        </div>
      </div>

      {/* STEP 1: UPLOAD - QuickUtil Purple Theme */}
      <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
        currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          {/* Header - QuickUtil Purple Gradient */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              PDF Sıkıştırma
            </h1>
            <p className="text-xl text-gray-700">
              Maksimum PDF kalitesi için optimize ederken dosya boyutunu küçültebilirsin.
            </p>
          </div>

          {/* Single Upload Button - Purple Gradient */}
          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <SparklesIcon className="h-5 w-5 mr-2" />
                PDF dosyasını seç
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
                title=""
                description=""
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              veya PDF'i buraya bırak
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: CONFIGURE - Purple Theme Layout */}
      <div ref={configureRef} className={`py-8 min-h-screen transition-all duration-500 ${
        currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        {selectedFile && (
          <div className="max-w-6xl mx-auto px-4">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Küçültme düzeyi
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left: File Preview - Purple Theme */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6 sticky top-8">
                  
                  {/* File Icon and Number */}
                  <div className="relative mx-auto w-32 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <DocumentIcon className="h-16 w-16 text-purple-600" />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      1
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm truncate">
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      {formatFileSize(selectedFile.size)}
                    </p>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-purple-600 hover:text-purple-700 text-xs flex items-center justify-center mx-auto transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Dosyayı kaldır
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Quality Options - Purple Theme */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {[
                    { 
                      id: 'screen', 
                      name: 'AŞIRI SIKIŞTIRMA',
                      desc: 'Daha az kaliteli, yüksek sıkıştırma',
                      recommended: false
                    },
                    { 
                      id: 'ebook', 
                      name: 'ÖNERİLEN SIKIŞTIRMA',
                      desc: 'Kaliteli, iyi sıkıştırma',
                      recommended: true
                    },
                    { 
                      id: 'printer', 
                      name: 'DÜŞÜK SIKIŞTIRMA',
                      desc: 'Yüksek kaliteli, daha az sıkıştırma',
                      recommended: false
                    }
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setQuality(level.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                        quality === level.id
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white/70 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{level.name}</div>
                          <div className="text-sm text-gray-600">{level.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          quality === level.id 
                            ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500' 
                            : 'border-gray-300'
                        }`}>
                          {quality === level.id && (
                            <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {level.recommended && (
                        <div className="mt-2">
                          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            ✓ ÖNERİLEN
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-center">{error}</p>
                  </div>
                )}

                {/* Compress Button - Purple Gradient */}
                <div className="mt-8">
                  <button
                    onClick={handleCompress}
                    disabled={!selectedFile || isCompressing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    PDF Küçültme
                    <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PROCESSING - Purple Theme */}
      <div ref={processingRef} className={`fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'processing' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-200">
            
            {/* Animated Icon - Purple Gradient */}
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center animate-pulse">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-20"></div>
            </div>

            {/* Processing Text */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              PDF küçültülüyor...
            </h2>
            <p className="text-gray-700 mb-6">
              Dosyanız işleniyor, lütfen bekleyin
            </p>

            {/* Progress - Purple Gradient */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-gray-600">
                {selectedFile?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: RESULT - Purple Theme */}
      <div ref={resultRef} className={`fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'result' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {compressionResult && (
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-200">
              
              {/* Success Icon - Green with Purple accent */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PDF küçültüldü!
                </h2>
              </div>

              {/* Stats - Purple Gradient Circle */}
              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">
                        {Math.round(compressionResult.compressionRatio)}%
                      </div>
                      <div className="text-xs uppercase tracking-wide">
                        Azalma
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Orijinal:</span> {formatFileSize(compressionResult.originalSize)}
                  </p>
                  <p>
                    <span className="font-medium">Sıkıştırılmış:</span> {formatFileSize(compressionResult.compressedSize)}
                  </p>
                </div>
              </div>

              {/* Other Tools Suggestions - iLovePDF Style */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
                  Şu araca geçiş yap:
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-convert" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF dönüştür</span>
                  </Link>

                  <Link
                    href="/image-convert"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim dönüştür</span>
                  </Link>

                  <Link
                    href="/image-compress"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ArrowDownTrayIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim sıkıştır</span>
                  </Link>

                  <Link
                    href="/image-crop"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim kırp</span>
                  </Link>

                  <Link
                    href="/image-resize"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim boyutlandır</span>
                  </Link>

                  <Link
                    href="/image-rotate"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ArrowLeftIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">Resim döndür</span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <a
                  href={compressionResult.downloadUrl}
                  download={`compressed_${selectedFile?.name}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Sıkıştırılmış PDF indir
                </a>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Yeni PDF Sıkıştır
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 