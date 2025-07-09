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
  Square2StackIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';

interface MergeResult {
  name: string;
  url: string;
  size: number;
  type: string;
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
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mergeProgress, setMergeProgress] = useState(0);

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
    canUseFeature('pdf_merge');
  }, [canUseFeature]);

  // Handle file selection (multiple files)
  const handleFileSelect = (files: File[] | File) => {
    const fileArray = Array.isArray(files) ? files : [files];
    
    setError(null);
    
    // Validate file count
    if (fileArray.length < 2) {
      setError(getErrorMessage('minFiles', locale));
      return;
    }
    
    if (fileArray.length > 10) {
      setError(getErrorMessage('maxFiles', locale));
      return;
    }
    
    // Validate total size
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
      setError(getErrorMessage('totalSizeLimit', locale));
      return;
    }
    
    setSelectedFiles(fileArray);
    setCurrentStep('configure');
  };

  // Get error messages based on locale
  const getErrorMessage = (type: string, locale: string) => {
    const messages = {
      tr: {
        minFiles: 'En az 2 PDF dosyası seçmelisiniz.',
        maxFiles: 'En fazla 10 PDF dosyası birleştirebilirsiniz.',
        totalSizeLimit: 'Toplam dosya boyutu 100MB\'dan büyük olamaz.',
        mergeFailed: 'PDF birleştirme sırasında hata oluştu.',
        invalidFile: 'Geçersiz PDF dosyası.'
      },
      en: {
        minFiles: 'Please select at least 2 PDF files.',
        maxFiles: 'Maximum 10 PDF files can be merged.',
        totalSizeLimit: 'Total file size cannot exceed 100MB.',
        mergeFailed: 'PDF merging failed.',
        invalidFile: 'Invalid PDF file.'
      },
      es: {
        minFiles: 'Seleccione al menos 2 archivos PDF.',
        maxFiles: 'Se pueden combinar máximo 10 archivos PDF.',
        totalSizeLimit: 'El tamaño total del archivo no puede exceder 100MB.',
        mergeFailed: 'Error al combinar PDF.',
        invalidFile: 'Archivo PDF inválido.'
      },
      fr: {
        minFiles: 'Veuillez sélectionner au moins 2 fichiers PDF.',
        maxFiles: 'Maximum 10 fichiers PDF peuvent être fusionnés.',
        totalSizeLimit: 'La taille totale du fichier ne peut pas dépasser 100 Mo.',
        mergeFailed: 'Échec de la fusion PDF.',
        invalidFile: 'Fichier PDF invalide.'
      },
      de: {
        minFiles: 'Bitte wählen Sie mindestens 2 PDF-Dateien aus.',
        maxFiles: 'Maximal 10 PDF-Dateien können zusammengefügt werden.',
        totalSizeLimit: 'Die Gesamtdateigröße darf 100MB nicht überschreiten.',
        mergeFailed: 'PDF-Zusammenführung fehlgeschlagen.',
        invalidFile: 'Ungültige PDF-Datei.'
      }
    };
    
    return messages[locale as keyof typeof messages]?.[type as keyof typeof messages.tr] || messages.tr[type as keyof typeof messages.tr];
  };

  // Get localized text
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  // Handle PDF merge (placeholder implementation)
  const handleMerge = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsMerging(true);
    setError(null);
    setCurrentStep('processing');
    setMergeProgress(0);
    
    try {
      // Progress simulation
      for (let progress = 0; progress <= 100; progress += 15) {
        setMergeProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Mock merge result
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const mergedFileName = `merged_document.pdf`;
      
      const result: MergeResult = {
        name: mergedFileName,
        url: URL.createObjectURL(selectedFiles[0]), // Mock URL
        size: totalSize * 0.9, // Simulate slight compression
        type: 'application/pdf'
      };
      
      setMergeResult(result);
      setCurrentStep('result');
      
      if (user) {
        // Track analytics
        console.log('PDF merge completed');
      }
      
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(getErrorMessage('mergeFailed', locale));
      setCurrentStep('configure');
      setMergeProgress(0);
    } finally {
      setIsMerging(false);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (newFiles.length < 2) {
      setCurrentStep('upload');
    }
  };

  // Move file up in order
  const moveFileUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...selectedFiles];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setSelectedFiles(newFiles);
  };

  // Move file down in order
  const moveFileDown = (index: number) => {
    if (index === selectedFiles.length - 1) return;
    const newFiles = [...selectedFiles];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setSelectedFiles(newFiles);
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFiles([]);
    setMergeResult(null);
    setError(null);
    setMergeProgress(0);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb />
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
        currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <div className="mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              {getText('pdfMerge.title', 'PDF Merge')}
            </h1>
            <p className="text-xl text-gray-800">
              {getText('pdfMerge.subtitle', 'Birden fazla PDF\'i tek dosyada birleştirin')}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <Square2StackIcon className="h-5 w-5 mr-2" />
                {getText('pdfConvert.filesUpload', 'PDF dosyalarını seç')}
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['application/pdf']}
                maxSize={100 * 1024 * 1024}
                multiple={true}
                title=""
                description=""
              />
            </div>
            
            <p className="text-sm text-gray-700 mt-4">
              {getText('pdfMerge.selectMultiple', 'En az 2, en fazla 10 PDF seçin')}
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
        {selectedFiles.length > 0 && (
          <div className="max-w-6xl mx-auto px-4">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {getText('pdfMerge.configure', 'Dosya Sıralaması')}
              </h1>
              <p className="text-gray-800">
                {getText('pdfMerge.dragToReorder', 'Dosyaları istediğiniz sırada düzenleyin')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* File List */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-orange-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded flex items-center justify-center">
                            <DocumentIcon className="h-8 w-8 text-orange-600" />
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm truncate max-w-xs">
                              {file.name}
                            </h3>
                            <p className="text-xs text-gray-700">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveFileUp(index)}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveFileDown(index)}
                            disabled={index === selectedFiles.length - 1}
                            className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-orange-200 p-6 sticky top-8">
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {getText('pdfMerge.summary', 'Birleştirme Özeti')}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{getText('pdfMerge.totalFiles', 'Toplam dosya')}:</span>
                      <span className="font-medium text-gray-900">{selectedFiles.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{getText('pdfMerge.totalSize', 'Toplam boyut')}:</span>
                      <span className="font-medium text-gray-900">
                        {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{getText('pdfMerge.outputName', 'Çıktı adı')}:</span>
                      <span className="font-medium text-gray-900">merged_document.pdf</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>{getText('pdfMerge.preserveQuality', 'Orijinal kalite korunur')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>{getText('pdfMerge.fastProcess', 'Hızlı işlem')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>{getText('pdfMerge.singleFile', 'Tek dosya çıktısı')}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-center text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleMerge}
                    disabled={selectedFiles.length < 2 || isMerging}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Square2StackIcon className="h-4 w-4 mr-2" />
                    {getText('pdfConvert.startConversion', 'PDF\'leri Birleştir')}
                    <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PROCESSING */}
      <div ref={processingRef} className={`fixed inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'processing' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-orange-200">
            
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center animate-pulse">
                <Square2StackIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              {getText('pdfMerge.merging', 'PDF\'ler birleştiriliyor...')}
            </h2>
            <p className="text-gray-800 mb-6">
              {getText('pdfMerge.processing', 'Dosyalar tek PDF\'de birleştiriliyor')}
            </p>

            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-600 to-red-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${mergeProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">
                {selectedFiles.length} dosya - {mergeProgress}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: RESULT */}
      <div ref={resultRef} className={`fixed inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'result' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {mergeResult && (
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-orange-200">
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {getText('pdfMerge.completed', 'PDF Birleştirme Tamamlandı!')}
                </h2>
              </div>

              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">
                        {selectedFiles.length}
                      </div>
                      <div className="text-xs uppercase tracking-wide">
                        {getText('pdfMerge.filesInOne', 'Dosya → 1')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-medium">{getText('pdfMerge.outputFile', 'Çıktı dosyası')}:</span> {mergeResult.name}
                  </p>
                  <p>
                    <span className="font-medium">{getText('pdfMerge.finalSize', 'Final boyut')}:</span> {formatFileSize(mergeResult.size)}
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.pdfCompress', 'PDF sıkıştır')}
                    </span>
                  </Link>

                  <Link
                    href="/pdf-to-images"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('pdfToImages.title', 'PDF to Images')}
                    </span>
                  </Link>

                  <Link
                    href="/pdf-to-text"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('pdfToText.title', 'PDF to Text')}
                    </span>
                  </Link>

                  <Link
                    href="/pdf-split"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ScissorsIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('pdfSplit.title', 'PDF Split')}
                    </span>
                  </Link>

                  <Link
                    href="/image-resize"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
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
                <a
                  href={mergeResult.url}
                  download={mergeResult.name}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {getText('pdfMerge.downloadMerged', 'Birleştirilmiş PDF\'i İndir')}
                </a>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-orange-300 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-200"
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