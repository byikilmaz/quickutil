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
  ScissorsIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from '@/lib/translations';
import JSZip from 'jszip';

interface SplitResult {
  name: string;
  url: string;
  size: number;
  type: string;
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
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'interval'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [interval, setInterval] = useState(1);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);

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
    canUseFeature('pdf_split');
  }, [canUseFeature]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    setError(null);
    
    if (file.size > 50 * 1024 * 1024) {
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
        fileSizeLimit: 'Dosya boyutu 50MB\'dan büyük olamaz.',
        splitFailed: 'PDF ayırma sırasında hata oluştu.',
        invalidFile: 'Geçersiz PDF dosyası.',
        zipCreationFailed: 'ZIP dosyası oluşturulurken hata oluştu.'
      },
      en: {
        fileSizeLimit: 'File size cannot exceed 50MB.',
        splitFailed: 'PDF splitting failed.',
        invalidFile: 'Invalid PDF file.',
        zipCreationFailed: 'Failed to create ZIP file.'
      },
      es: {
        fileSizeLimit: 'El tamaño del archivo no puede exceder 50MB.',
        splitFailed: 'Error al dividir PDF.',
        invalidFile: 'Archivo PDF inválido.',
        zipCreationFailed: 'Error al crear archivo ZIP.'
      },
      fr: {
        fileSizeLimit: 'La taille du fichier ne peut pas dépasser 50 Mo.',
        splitFailed: 'Échec de la division PDF.',
        invalidFile: 'Fichier PDF invalide.',
        zipCreationFailed: 'Échec de la création du fichier ZIP.'
      },
      de: {
        fileSizeLimit: 'Die Dateigröße darf 50MB nicht überschreiten.',
        splitFailed: 'PDF-Aufteilung fehlgeschlagen.',
        invalidFile: 'Ungültige PDF-Datei.',
        zipCreationFailed: 'Fehler beim Erstellen der ZIP-Datei.'
      }
    };
    
    return messages[locale as keyof typeof messages]?.[type as keyof typeof messages.tr] || messages.tr[type as keyof typeof messages.tr];
  };

  // Get localized text
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  // Handle PDF split (placeholder implementation)
  const handleSplit = async () => {
    if (!selectedFile) return;
    
    setIsSplitting(true);
    setError(null);
    setCurrentStep('processing');
    setSplitProgress(0);
    
    try {
      // Progress simulation
      let progressInterval: number | null = null;
      progressInterval = window.setInterval(() => {
        setSplitProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate split process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (progressInterval) clearInterval(progressInterval);
      setSplitProgress(100);
      
      // Mock split results based on split mode
      const totalPages = Math.floor(Math.random() * 10) + 5; // 5-15 pages
      let mockResults: SplitResult[] = [];
      
      if (splitMode === 'all') {
        mockResults = Array.from({ length: totalPages }, (_, i) => ({
          name: `page_${i + 1}.pdf`,
          url: URL.createObjectURL(selectedFile), // Mock URL
          size: Math.floor(Math.random() * 200000) + 50000,
          type: 'application/pdf'
        }));
      } else if (splitMode === 'range') {
        const pages = Math.min(pageRange.end - pageRange.start + 1, totalPages);
        mockResults = Array.from({ length: pages }, (_, i) => ({
          name: `pages_${pageRange.start + i}.pdf`,
          url: URL.createObjectURL(selectedFile),
          size: Math.floor(Math.random() * 200000) + 50000,
          type: 'application/pdf'
        }));
      } else if (splitMode === 'interval') {
        const chunks = Math.ceil(totalPages / interval);
        mockResults = Array.from({ length: chunks }, (_, i) => ({
          name: `chunk_${i + 1}.pdf`,
          url: URL.createObjectURL(selectedFile),
          size: Math.floor(Math.random() * 500000) + 100000,
          type: 'application/pdf'
        }));
      }
      
      setSplitResults(mockResults);
      setCurrentStep('result');
      
      if (user) {
        // Track analytics
        console.log('PDF split completed');
      }
      
    } catch (err: any) {
      console.error('Split error:', err);
      setError(getErrorMessage('splitFailed', locale));
      setCurrentStep('configure');
      setSplitProgress(0);
    } finally {
      setIsSplitting(false);
    }
  };

  // Handle download all as ZIP
  const handleDownloadAll = async () => {
    if (splitResults.length === 0) return;
    
    if (splitResults.length === 1) {
      // Single file - direct download
      const link = document.createElement('a');
      link.href = splitResults[0].url;
      link.download = splitResults[0].name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Multiple files - ZIP download
    setIsDownloadingAll(true);
    
    try {
      const zip = new JSZip();
      
      for (const result of splitResults) {
        const response = await fetch(result.url);
        const blob = await response.blob();
        zip.file(result.name, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `split_pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('ZIP creation error:', error);
      setError(getErrorMessage('zipCreationFailed', locale));
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setSplitResults([]);
    setError(null);
    setSplitProgress(0);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50">
      {/* SEO */}
      <StructuredData type="howto" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
              {getText('pdfSplit.title', 'PDF Split')}
            </h1>
            <p className="text-xl text-gray-800">
              {getText('pdfSplit.subtitle', 'PDF\'i sayfalara veya bölümlere ayırın')}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <ScissorsIcon className="h-5 w-5 mr-2" />
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
                maxSize={50 * 1024 * 1024}
                title={getText('pdfSplit.selectFile', 'PDF Dosyasını Seçin')}
                description={getText('pdfSplit.selectDescription', 'Ayırmak istediğiniz PDF dosyasını seçin')}
                locale={locale}
                texts={{
                  selectFiles: getText('pdfSplit.selectFiles', 'PDF Dosyalarını Seç'),
                  selectFile: getText('pdfSplit.selectFile', 'PDF Dosyasını Seç'),
                  dragDrop: getText('pdfSplit.dragDrop', 'PDF dosyasını buraya sürükleyin'),
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                {getText('pdfSplit.configure', 'Ayırma Seçenekleri')}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* File Preview */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6 sticky top-8">
                  
                  <div className="relative mx-auto w-32 h-40 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <DocumentIcon className="h-16 w-16 text-purple-600" />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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
                      className="text-purple-600 hover:text-purple-700 text-xs flex items-center justify-center mx-auto transition-colors"
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
                  
                  {/* Split Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {getText('pdfSplit.splitMode', 'Ayırma Modu')}
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => setSplitMode('all')}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          splitMode === 'all'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50'
                            : 'border-gray-200 hover:border-purple-300 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {getText('pdfSplit.allPages', 'Tüm Sayfalar')}
                            </div>
                            <div className="text-sm text-gray-700">
                              {getText('pdfSplit.allPagesDesc', 'Her sayfayı ayrı PDF olarak ayır')}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            splitMode === 'all' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-violet-500' 
                              : 'border-gray-300'
                          }`}>
                            {splitMode === 'all' && (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSplitMode('range')}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          splitMode === 'range'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50'
                            : 'border-gray-200 hover:border-purple-300 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {getText('pdfSplit.pageRange', 'Sayfa Aralığı')}
                            </div>
                            <div className="text-sm text-gray-700">
                              {getText('pdfSplit.pageRangeDesc', 'Belirli sayfa aralığını ayır')}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            splitMode === 'range' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-violet-500' 
                              : 'border-gray-300'
                          }`}>
                            {splitMode === 'range' && (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSplitMode('interval')}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          splitMode === 'interval'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50'
                            : 'border-gray-200 hover:border-purple-300 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {getText('pdfSplit.interval', 'Sayfa Aralıkları')}
                            </div>
                            <div className="text-sm text-gray-700">
                              {getText('pdfSplit.intervalDesc', 'Belirli sayfa sayısında bölümler oluştur')}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            splitMode === 'interval' 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-violet-500' 
                              : 'border-gray-300'
                          }`}>
                            {splitMode === 'interval' && (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Page Range Settings */}
                  {splitMode === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        {getText('pdfSplit.pageNumbers', 'Sayfa Numaraları')}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            {getText('pdfSplit.startPage', 'Başlangıç')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pageRange.start}
                            onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            {getText('pdfSplit.endPage', 'Bitiş')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pageRange.end}
                            onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interval Settings */}
                  {splitMode === 'interval' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        {getText('pdfSplit.pagesPerChunk', 'Bölüm Başına Sayfa Sayısı')}: {interval}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={interval}
                        onChange={(e) => setInterval(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-center">{error}</p>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={handleSplit}
                    disabled={!selectedFile || isSplitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ScissorsIcon className="h-4 w-4 mr-2" />
                    {getText('pdfConvert.startConversion', 'PDF\'i Ayır')}
                    <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PROCESSING */}
      <div ref={processingRef} className={`fixed inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'processing' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-200">
            
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center animate-pulse">
                <ScissorsIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
              {getText('pdfSplit.splitting', 'PDF ayırılıyor...')}
            </h2>
            <p className="text-gray-800 mb-6">
              {getText('pdfSplit.processing', 'Sayfalar işleniyor ve ayrı dosyalar oluşturuluyor')}
            </p>

            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-violet-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${splitProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">
                {selectedFile?.name} - {splitProgress}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: RESULT */}
      <div ref={resultRef} className={`fixed inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 flex items-center justify-center z-40 transition-all duration-500 ${
        currentStep === 'result' ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {splitResults.length > 0 && (
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-200">
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {getText('pdfSplit.completed', 'PDF Ayırma Tamamlandı!')}
                </h2>
              </div>

              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">
                        {splitResults.length}
                      </div>
                      <div className="text-xs uppercase tracking-wide">
                        {getText('pdfSplit.totalFiles', 'Dosya')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-medium">Mod:</span> {
                      splitMode === 'all' ? getText('pdfSplit.allPages', 'Tüm Sayfalar') :
                      splitMode === 'range' ? getText('pdfSplit.pageRange', 'Sayfa Aralığı') :
                      getText('pdfSplit.interval', 'Sayfa Aralıkları')
                    }
                  </p>
                  <p>
                    <span className="font-medium">Toplam boyut:</span> {
                      formatFileSize(splitResults.reduce((sum, file) => sum + file.size, 0))
                    }
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentTextIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('pdfToText.title', 'PDF to Text')}
                    </span>
                  </Link>

                  <Link
                    href="/image-crop"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    splitResults.length > 1 ? getText('pdfConvert.downloadAll', 'Tümünü İndir (ZIP)') : getText('pdfConvert.downloadAllSingle', 'Dosyayı İndir')
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
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