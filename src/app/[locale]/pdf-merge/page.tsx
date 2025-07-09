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
  Square2StackIcon,
  PhotoIcon,
  DocumentTextIcon,
  ScissorsIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import { mergePDFs, ConversionResult } from '@/lib/pdfConvertUtils';


interface ConversionResultDisplay {
  result: ConversionResult;
  originalCount: number;
  processingTime: number;
  totalOriginalSize: number;
}

// Server wrapper component to handle async params
export default async function PDFMergePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFMerge locale={locale} />;
}

// Client component with direct locale prop
function PDFMerge({ locale }: { locale: string }) {
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  // Handle file selection (multiple files)
  const handleFileSelect = (files: File[]) => {
    if (!canUseFeature('pdf_convert')) {
      setError('Günlük PDF dönüştürme limitiniz doldu. Lütfen yarın tekrar deneyin.');
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        setError(`${file.name} dosyası 20MB'dan büyük. Lütfen daha küçük dosyalar seçin.`);
        return false;
      }
      return true;
    });

    if (validFiles.length < 2) {
      setError('En az 2 PDF dosyası seçmelisiniz.');
      return;
    }

    setSelectedFiles(validFiles);
    setError(null);
    setCurrentStep('configure');
  };

  // Move file up in order
  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newFiles = [...selectedFiles];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      setSelectedFiles(newFiles);
    }
  };

  // Move file down in order
  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (newFiles.length < 2) {
      setCurrentStep('upload');
    }
  };

  // Process conversion
  const handleConvert = async () => {
    if (selectedFiles.length < 2) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing steps
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 8, 90));
    }, 300);

    const startTime = Date.now();

    try {
      const result = await mergePDFs(selectedFiles);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Calculate results
      const totalOriginalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
      const processingTime = Date.now() - startTime;

      setConversionResult({
        result,
        originalCount: selectedFiles.length,
        processingTime,
        totalOriginalSize
      });

      // Upload to storage if user is logged in
      if (user) {
        try {
          const response = await fetch(result.url);
          const blob = await response.blob();
          const file = new File([blob], result.name, { type: result.type });
          await uploadFile(file, 'pdf');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }

      setCurrentStep('result');

    } catch (error) {
      console.error('Merge error:', error);
      setError(error instanceof Error ? error.message : 'PDF birleştirme sırasında hata oluştu');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFiles([]);
    setConversionResult(null);
    setError(null);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <StructuredData 
        page="pdf-merge"
        type="tool"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="min-h-screen flex flex-col justify-center">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-6">
                <Square2StackIcon className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                {locale === 'en' ? 'AI PDF Merge' :
                 locale === 'es' ? 'Fusión PDF con IA' :
                 locale === 'de' ? 'AI PDF-Zusammenführung' :
                 locale === 'fr' ? 'Fusion PDF IA' :
                 'AI PDF Birleştir'}
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                {locale === 'en' ? 'Merge multiple PDF documents into one file using AI technology. Drag to reorder files.' :
                 locale === 'es' ? 'Fusiona múltiples documentos PDF en un archivo usando tecnología IA. Arrastra para reordenar archivos.' :
                 locale === 'de' ? 'Führen Sie mehrere PDF-Dokumente mit KI-Technologie zu einer Datei zusammen. Ziehen Sie zum Neuordnen der Dateien.' :
                 locale === 'fr' ? 'Fusionnez plusieurs documents PDF en un seul fichier avec la technologie IA. Glissez pour réorganiser les fichiers.' :
                 'Birden fazla PDF belgesini yapay zeka teknolojisi ile tek dosyada birleştirin'}
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="border-2 border-dashed border-orange-300 rounded-2xl p-16 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all duration-300">
                  <FileUpload
                    onFileSelect={(files) => {
                      if (Array.isArray(files)) {
                        handleFileSelect(files);
                      } else {
                        handleFileSelect([files]);
                      }
                    }}
                    acceptedTypes={['application/pdf']}
                    maxSize={20 * 1024 * 1024}
                    title=""
                    description=""
                    multiple={true}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <CloudArrowUpIcon className="h-16 w-16 text-orange-500 mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      PDF dosyalarını seç veya sürükle
                    </p>
                    <p className="text-gray-500">
                      En az 2 dosya • Maksimum 20MB/dosya • Sırayla birleştirme
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 'configure' && selectedFiles.length >= 2 && (
          <div ref={configureRef} className="min-h-screen flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Info - Left Side */}
              <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 h-fit">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 mb-4">
                    <Square2StackIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Birleştirme</h2>
                  <p className="text-gray-600">Akıllı dosya birleştirme</p>
                </div>

                {/* File Count */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <div className="flex items-center space-x-3">
                    <Square2StackIcon className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFiles.length} PDF Dosyası</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB toplam
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Sırayla birleştirme</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Orijinal kalite korunur</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Tek dosya çıktısı</span>
                  </div>
                </div>
              </div>

              {/* File List - Right Side */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Dosya Sırası</h3>
                  
                  {/* File List */}
                  <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-orange-600 mb-1">{index + 1}</span>
                          </div>
                          <DocumentIcon className="h-8 w-8 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveFileUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveFileDown(index)}
                            disabled={index === selectedFiles.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-400 hover:text-red-600 ml-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Birleştirme Bilgileri</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Dosyalar yukarıdan aşağıya sırayla birleştirilir</li>
                      <li>• Sırayı değiştirmek için ok butonlarını kullanın</li>
                      <li>• İstenmeyen dosyaları çöp kutusu ile kaldırın</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConvert}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      📚 PDF'leri Birleştir
                    </button>
                    <button
                      onClick={() => setSelectedFiles([])}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Square2StackIcon className="h-12 w-12 text-orange-600 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Processing Text */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                PDF'ler birleştiriliyor...
              </h2>
              <p className="text-gray-600 mb-8">
                {selectedFiles.length} dosya tek PDF halinde birleştiriliyor
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-orange-600 to-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">%{processingProgress} tamamlandı</p>

              {/* Processing Steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  '📄 PDF dosyaları yükleniyor...',
                  '🔗 Dosyalar sırayla birleştiriliyor...',
                  '📁 Birleştirilmiş dosya hazırlanıyor...'
                ].map((step, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
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
                  Birleştirme Tamamlandı! 📚
                </h2>
                <p className="text-gray-600">
                  {conversionResult.originalCount} dosya başarıyla birleştirildi
                </p>
              </div>

              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">{conversionResult.originalCount}</div>
                  <div className="text-sm text-gray-600">Birleştirilen Dosya</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {(conversionResult.result.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-600">Çıktı Boyutu</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 md:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {(conversionResult.processingTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">İşlem Süresi</div>
                </div>
              </div>

              {/* Download Button */}
              <div className="mb-8">
                <a
                  href={conversionResult.result.url}
                  download={conversionResult.result.name}
                  className="inline-flex items-center space-x-3 p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowDownTrayIcon className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-lg">📚 Birleştirilmiş PDF'i İndir</div>
                    <div className="text-sm opacity-90">{conversionResult.result.name}</div>
                  </div>
                </a>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Yeni Birleştirme
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
              <div className="pt-6 border-t border-gray-200">
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
                    href="/pdf-split" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
                      <ScissorsIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">PDF Ayır</span>
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