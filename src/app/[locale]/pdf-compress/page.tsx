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
import { compressPDF, formatFileSize, calculateCompressionRatio } from '@/lib/pdfUtils';

interface CompressionResultDisplay {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  downloadUrl: string;
}

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
  const [compressionProgress, setCompressionProgress] = useState(0);

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
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
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
        compressionFailed: 'Sıkıştırma sırasında hata oluştu.',
        invalidFile: 'Geçersiz PDF dosyası.',
        networkError: 'Ağ bağlantısı hatası.'
      },
      en: {
        fileSizeLimit: 'File size cannot exceed 20MB.',
        compressionFailed: 'Compression failed.',
        invalidFile: 'Invalid PDF file.',
        networkError: 'Network connection error.'
      },
      es: {
        fileSizeLimit: 'El tamaño del archivo no puede exceder 20MB.',
        compressionFailed: 'Error en la compresión.',
        invalidFile: 'Archivo PDF inválido.',
        networkError: 'Error de conexión de red.'
      },
      fr: {
        fileSizeLimit: 'La taille du fichier ne peut pas dépasser 20 Mo.',
        compressionFailed: 'Échec de la compression.',
        invalidFile: 'Fichier PDF invalide.',
        networkError: 'Erreur de connexion réseau.'
      },
      de: {
        fileSizeLimit: 'Die Dateigröße darf 20MB nicht überschreiten.',
        compressionFailed: 'Komprimierung fehlgeschlagen.',
        invalidFile: 'Ungültige PDF-Datei.',
        networkError: 'Netzwerkverbindungsfehler.'
      }
    };
    
    return messages[locale as keyof typeof messages]?.[type as keyof typeof messages.tr] || messages.tr[type as keyof typeof messages.tr];
  };

  // Handle compression with real functionality
  const handleCompress = async () => {
    if (!selectedFile) return;
    
    setIsCompressing(true);
    setError(null);
    setCurrentStep('processing');
    setCompressionProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Determine compression ratio based on quality
      let compressionRatio = 0.7; // Default
      switch (quality) {
        case 'screen':
          compressionRatio = 0.3; // High compression
          break;
        case 'ebook':
          compressionRatio = 0.6; // Balanced
          break;
        case 'printer':
          compressionRatio = 0.8; // Light compression
          break;
      }

      const startTime = Date.now();
      
      // Use real PDF compression from pdfUtils
      const compressedFile = await compressPDF(selectedFile, compressionRatio);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      // Create download URL
      const downloadUrl = URL.createObjectURL(compressedFile);
      
      // Calculate actual compression ratio
      const actualRatio = calculateCompressionRatio(selectedFile.size, compressedFile.size);
      
      const compressionResultData: CompressionResultDisplay = {
        compressedBlob: compressedFile,
        originalSize: selectedFile.size,
        compressedSize: compressedFile.size,
        compressionRatio: actualRatio,
        processingTime,
        downloadUrl
      };
      
      setCompressionResult(compressionResultData);
      setCurrentStep('result');
      
      // Track analytics
      if (user) {
        await uploadFile(compressedFile, 'pdf');
      }
      
    } catch (err: any) {
      console.error('Compression error:', err);
      let errorMessage = getErrorMessage('compressionFailed', locale);
      
      if (err.message.includes('PDF sıkıştırma hatası') || err.message.includes('PDF compression error')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCurrentStep('configure');
      setCompressionProgress(0);
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
    setCompressionProgress(0);
  };

  // Get localized text
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
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
              {getText('pdfCompress.title', 'PDF Sıkıştırma')}
            </h1>
            <p className="text-xl text-gray-800">
              {getText('pdfCompress.subtitle', 'Maksimum PDF kalitesi için optimize ederken dosya boyutunu küçültebilirsin.')}
            </p>
          </div>

          {/* Single Upload Button - Purple Gradient */}
          <div className="max-w-sm mx-auto">
            <div className="relative group cursor-pointer">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105">
                <SparklesIcon className="h-5 w-5 mr-2" />
                {getText('pdfCompress.uploadTitle', 'PDF dosyasını seç')}
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
            
            <p className="text-sm text-gray-700 mt-4">
              {getText('pdfCompress.uploadDescription', 'veya PDF\'i buraya bırak')}
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
                {getText('pdfCompress.compressionLevel', 'Küçültme düzeyi')}
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

              {/* Right: Quality Options - Purple Theme */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {[
                    { 
                      id: 'screen', 
                      name: getText('pdfCompress.high', 'AŞIRI SIKIŞTIRMA'),
                      desc: getText('pdfCompress.highDesc', 'Daha az kaliteli, yüksek sıkıştırma'),
                      recommended: false
                    },
                    { 
                      id: 'ebook', 
                      name: getText('pdfCompress.medium', 'ÖNERİLEN SIKIŞTIRMA'),
                      desc: getText('pdfCompress.mediumDesc', 'Kaliteli, iyi sıkıştırma'),
                      recommended: true
                    },
                    { 
                      id: 'printer', 
                      name: getText('pdfCompress.light', 'DÜŞÜK SIKIŞTIRMA'),
                      desc: getText('pdfCompress.lightDesc', 'Yüksek kaliteli, daha az sıkıştırma'),
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
                          <div className="text-sm text-gray-700">{level.desc}</div>
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
                    {getText('pdfCompress.startCompression', 'PDF Küçültme')}
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
              {getText('pdfCompress.processing', 'PDF küçültülüyor...')}
            </h2>
            <p className="text-gray-800 mb-6">
              {getText('pdfCompress.processingDesc', 'Dosyanız işleniyor, lütfen bekleyin')}
            </p>

            {/* Progress - Purple Gradient */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 w-full mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-700">
                {selectedFile?.name} - {compressionProgress}%
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
                  {getText('pdfCompress.completed', 'PDF küçültüldü!')}
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
                        {getText('pdfCompress.results.savings', 'Azalma')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-medium">{getText('pdfCompress.originalSize', 'Orijinal')}:</span> {formatFileSize(compressionResult.originalSize)}
                  </p>
                  <p>
                    <span className="font-medium">{getText('pdfCompress.results.newSize', 'Sıkıştırılmış')}:</span> {formatFileSize(compressionResult.compressedSize)}
                  </p>
                </div>
              </div>

              {/* Other Tools Suggestions - iLovePDF Style */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
                  {getText('pdfCompress.otherTools', 'Şu araca geçiş yap:')}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
                  <Link
                    href="/pdf-convert" 
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <DocumentIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.pdfConvert', 'PDF dönüştür')}
                    </span>
                  </Link>

                  <Link
                    href="/image-convert"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                      {getText('tools.imageFormat', 'Resim dönüştür')}
                    </span>
                  </Link>

                  <Link
                    href="/image-compress"
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
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
                <a
                  href={compressionResult.downloadUrl}
                  download={`compressed_${selectedFile?.name}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {getText('pdfCompress.downloadAllSingle', 'Sıkıştırılmış PDF indir')}
                </a>
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  {getText('pdfCompress.newConversion', 'Yeni PDF Sıkıştır')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 