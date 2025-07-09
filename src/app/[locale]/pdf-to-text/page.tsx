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
  DocumentTextIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';

interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
  downloadUrl: string;
}

// Server wrapper component to handle async params
export default async function PDFToTextPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFToText locale={locale} />;
}

// Client component with direct locale prop
function PDFToText({ locale }: { locale: string }) {
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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);

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
    canUseFeature('pdf_to_text');
  }, [canUseFeature]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    setError(null);
    
    if (file.size > 20 * 1024 * 1024) {
      setError(getErrorMessage('fileSizeLimit', locale));
      return;
    }
    
    setSelectedFile(file);
    setCurrentStep('configure');
  };

  // Get error messages based on locale
  const getErrorMessage = (type: string, locale: string) => {
    const messages = {
      tr: {
        fileSizeLimit: 'Dosya boyutu 20MB\'dan büyük olamaz.',
        extractionFailed: 'Metin çıkarma sırasında hata oluştu.',
        invalidFile: 'Geçersiz PDF dosyası.',
        noTextFound: 'PDF\'de metin bulunamadı.'
      },
      en: {
        fileSizeLimit: 'File size cannot exceed 20MB.',
        extractionFailed: 'Text extraction failed.',
        invalidFile: 'Invalid PDF file.',
        noTextFound: 'No text found in PDF.'
      },
      es: {
        fileSizeLimit: 'El tamaño del archivo no puede exceder 20MB.',
        extractionFailed: 'Error en la extracción de texto.',
        invalidFile: 'Archivo PDF inválido.',
        noTextFound: 'No se encontró texto en el PDF.'
      },
      fr: {
        fileSizeLimit: 'La taille du fichier ne peut pas dépasser 20 Mo.',
        extractionFailed: 'Échec de l\'extraction de texte.',
        invalidFile: 'Fichier PDF invalide.',
        noTextFound: 'Aucun texte trouvé dans le PDF.'
      },
      de: {
        fileSizeLimit: 'Die Dateigröße darf 20MB nicht überschreiten.',
        extractionFailed: 'Textextraktion fehlgeschlagen.',
        invalidFile: 'Ungültige PDF-Datei.',
        noTextFound: 'Kein Text in PDF gefunden.'
      }
    };
    
    return messages[locale as keyof typeof messages]?.[type as keyof typeof messages.tr] || messages.tr[type as keyof typeof messages.tr];
  };

  // Get localized text
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  // Handle text extraction (placeholder implementation)
  const handleExtract = async () => {
    if (!selectedFile) return;
    
    setIsExtracting(true);
    setError(null);
    setCurrentStep('processing');
    setExtractionProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 12;
        });
      }, 300);

      // Simulate extraction process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      // Mock extraction result
      const mockText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.

Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;
      
      const blob = new Blob([mockText], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const result: ExtractionResult = {
        text: mockText,
        wordCount: mockText.split(/\s+/).filter(word => word.length > 0).length,
        charCount: mockText.length,
        downloadUrl
      };
      
      setExtractionResult(result);
      setCurrentStep('result');
      
      if (user) {
        // Track analytics
        console.log('Text extraction completed');
      }
      
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(getErrorMessage('extractionFailed', locale));
      setCurrentStep('configure');
      setExtractionProgress(0);
    } finally {
      setIsExtracting(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setExtractionResult(null);
    setError(null);
    setExtractionProgress(0);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              {getText('pdfToText.title', 'PDF to Text')}
            </h1>
            <p className="text-xl text-gray-800">
              {getText('pdfToText.subtitle', 'PDF\'den metni çıkarın ve düzenlenebilir formata dönüştürün')}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
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
                title={getText('pdfToText.selectFile', 'PDF Dosyasını Seçin')}
                description={getText('pdfToText.selectDescription', 'Metin çıkarmak istediğiniz PDF dosyasını seçin')}
                locale={locale}
                texts={{
                  selectFiles: getText('pdfToText.selectFiles', 'PDF Dosyalarını Seç'),
                  selectFile: getText('pdfToText.selectFile', 'PDF Dosyasını Seç'),
                  dragDrop: getText('pdfToText.dragDrop', 'PDF dosyasını buraya sürükleyin'),
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {getText('pdfToText.extracting', 'Metin Çıkarma Ayarları')}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* File Preview */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-green-200 p-6 sticky top-8">
                  
                  <div className="relative mx-auto w-32 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <DocumentIcon className="h-16 w-16 text-green-600" />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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
                      className="text-green-600 hover:text-green-700 text-xs flex items-center justify-center mx-auto transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      {getText('pdfCompress.remove.file', 'Dosyayı kaldır')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="lg:col-span-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-green-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {getText('pdfToText.description', 'OCR Teknolojisi ile Metin Çıkarma')}
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>Gelişmiş OCR teknolojisi</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>Çoklu dil desteği</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>Yüksek doğruluk oranı</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span>Formatlanmış metin korunur</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-center">{error}</p>
                    </div>
                  )}

                  <div className="mt-8">
                    <button
                      onClick={handleExtract}
                      disabled={!selectedFile || isExtracting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      {getText('pdfConvert.startConversion', 'Metni Çıkar')}
                      <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PROCESSING */}
      <div ref={processingRef} className={`fixed inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'processing' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-green-200">
            
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center animate-pulse">
                <DocumentTextIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {getText('pdfToText.extracting', 'PDF\'den metin çıkarılıyor...')}
            </h2>
            <p className="text-gray-800 mb-6">
              {getText('pdfToText.aiProcessing', 'OCR teknolojisi ile metin tanıma işlemi')}
            </p>

            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${extractionProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">
                {selectedFile?.name} - {extractionProgress}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: RESULT */}
      <div ref={resultRef} className={`fixed inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'result' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {extractionResult && (
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-green-200">
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {getText('pdfToText.completed', 'Metin Çıkarma Tamamlandı!')}
                </h2>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{extractionResult.wordCount}</div>
                  <div className="text-sm text-gray-700">{getText('pdfToText.totalWords', 'Toplam Kelime')}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{extractionResult.charCount}</div>
                  <div className="text-sm text-gray-700">{getText('pdfToText.totalChars', 'Toplam Karakter')}</div>
                </div>
              </div>

              {/* Text Preview */}
              <div className="mb-8">
                <div className="bg-white rounded-lg border border-green-200 p-6 max-h-60 overflow-y-auto text-left">
                  <h4 className="font-medium text-gray-900 mb-3">Çıkarılan Metin Önizlemesi:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {extractionResult.text.substring(0, 500)}
                    {extractionResult.text.length > 500 && '...'}
                  </pre>
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('pdfToImages.title', 'PDF to Images')}
                    </span>
                  </Link>

                  <Link
                    href="/image-compress"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
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
                  href={extractionResult.downloadUrl}
                  download="extracted_text.txt"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {getText('pdfToText.downloadText', 'Metin Dosyasını İndir')}
                </a>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-200"
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