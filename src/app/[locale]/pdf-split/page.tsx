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
  ScissorsIcon,
  PhotoIcon,
  DocumentTextIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { splitPDF, ConversionResult } from '@/lib/pdfConvertUtils';


interface ConversionResultDisplay {
  results: ConversionResult[];
  totalSize: number;
  pageCount: number;
  processingTime: number;
  downloadUrls: { name: string; url: string; size: number }[];
}

// Server wrapper component to handle async params
export default async function PDFSplitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFSplit locale={locale} />;
}

// Client component with direct locale prop
function PDFSplit({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'pages'>('all');
  const [pageRange, setPageRange] = useState<string>('1-5');
  const [specificPages, setSpecificPages] = useState<string>('1,3,5');
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
      setProcessingProgress(prev => Math.min(prev + 12, 90));
    }, 250);

    const startTime = Date.now();

    try {
      const results = await splitPDF(selectedFile);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Calculate results
      const totalProcessedSize = results.reduce((total, result) => total + result.size, 0);
      const processingTime = Date.now() - startTime;

      setConversionResult({
        results,
        totalSize: totalProcessedSize,
        pageCount: results.length,
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
          await uploadFile(file, 'pdf');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }

      setCurrentStep('result');

    } catch (error) {
      console.error('Split error:', error);
      setError(error instanceof Error ? error.message : 'PDF ayırma sırasında hata oluştu');
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
        page="pdf-split"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full mb-6">
                <ScissorsIcon className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                PDF Ayırma
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                PDF sayfalarını ayrı dosyalar halinde bölün
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300">
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
                  <CloudArrowUpIcon className="h-16 w-16 text-purple-500 mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      PDF dosyasını seç veya sürükle
                    </p>
                    <p className="text-gray-500">
                      Maksimum 20MB • Akıllı sayfa ayırma
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 mb-4">
                    <ScissorsIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Ayırma</h2>
                  <p className="text-gray-600">Akıllı sayfa bölme</p>
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
                    <span>Her sayfa ayrı PDF</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Yüksek hızda işlem</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Orijinal kalite korunur</span>
                  </div>
                </div>
              </div>

              {/* Settings - Right Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Ayırma Ayarları</h3>
                  
                  {/* Split Mode Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Ayırma Modu</label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setSplitMode('all')}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          splitMode === 'all'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📄</div>
                          <div>
                            <div className="font-semibold text-gray-900">Tüm Sayfalar</div>
                            <div className="text-sm text-gray-600">Her sayfayı ayrı PDF olarak ayır</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSplitMode('range')}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          splitMode === 'range'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📊</div>
                          <div>
                            <div className="font-semibold text-gray-900">Sayfa Aralığı</div>
                            <div className="text-sm text-gray-600">Belirli sayfa aralığını ayır (örn: 1-5)</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSplitMode('pages')}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          splitMode === 'pages'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🎯</div>
                          <div>
                            <div className="font-semibold text-gray-900">Belirli Sayfalar</div>
                            <div className="text-sm text-gray-600">Seçili sayfaları ayır (örn: 1,3,5)</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Range Input */}
                  {splitMode === 'range' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Aralığı</label>
                      <input
                        type="text"
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                        placeholder="1-5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Örnek: 1-5, 10-15</p>
                    </div>
                  )}

                  {/* Specific Pages Input */}
                  {splitMode === 'pages' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Numaraları</label>
                      <input
                        type="text"
                        value={specificPages}
                        onChange={(e) => setSpecificPages(e.target.value)}
                        placeholder="1,3,5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Virgülle ayırın: 1,3,5,8</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConvert}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      ✂️ PDF'i Ayır
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
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <ScissorsIcon className="h-12 w-12 text-purple-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Processing Text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                PDF ayırılıyor...
              </h2>
              <p className="text-gray-600 mb-8">
                Her sayfa ayrı PDF dosyası olarak hazırlanıyor
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-violet-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">%{processingProgress} tamamlandı</p>

              {/* Processing Steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  '📄 PDF sayfaları analiz ediliyor...',
                  '✂️ Sayfalar ayrı dosyalara bölünüyor...',
                  '📁 Dosyalar hazırlanıyor...'
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
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
                  PDF Ayırma Tamamlandı! ✂️
                </h2>
                <p className="text-gray-600">
                  {conversionResult.pageCount} sayfa başarıyla ayrıldı
                </p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">{conversionResult.pageCount}</div>
                  <div className="text-sm text-gray-600">Ayrılan Sayfa</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {(conversionResult.totalSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-600">Toplam Boyut</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 md:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {(conversionResult.processingTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">İşlem Süresi</div>
                </div>
              </div>

              {/* Download Files */}
              <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                {conversionResult.downloadUrls.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download={file.name}
                    className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-8 w-8 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <ArrowDownTrayIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                  </a>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Yeni Ayırma
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
                    href="/pdf-to-images" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF to Images</span>
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