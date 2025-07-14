'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpTrayIcon, DocumentCheckIcon, SparklesIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { getTranslations } from '@/lib/translations';
import { compressPDF, type CompressionResult } from '@/lib/pdfUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/contexts/StorageContext';
import { useQuota } from '@/contexts/QuotaContext';

interface CompressionResultDisplay {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  downloadUrl: string;
}

export default async function PDFCompressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PDFCompress locale={locale} />;
}

function PDFCompress({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = getTranslations(locale);
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const { canUseFeature } = useQuota();
  
  // Enhanced browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`));
      
      console.log('🌍 PDF COMPRESS DEBUG - Enhanced Browser Language Auto-Detection:', {
        currentPath,
        currentLocale: locale,
        browserLanguage: navigator.language,
        browserLanguages: navigator.languages,
        supportedLanguages,
        hasLocaleInPath,
        timestamp: new Date().toISOString()
      });
      
      if (!hasLocaleInPath) {
        const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
        const preferredLanguage = localStorage.getItem('quickutil_preferred_locale');
        
        console.log('🌍 PDF COMPRESS DEBUG - Language Detection Process:', {
          currentPath,
          browserLanguage,
          preferredLanguage,
          supportedLanguages,
          hasLocaleInPath,
          step: 'language-detection'
        });
        
        let targetLanguage = 'en'; // Default to English
        
        // Priority 1: User's stored preference
        if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
          targetLanguage = preferredLanguage;
          console.log('🌍 PDF COMPRESS DEBUG - Using stored preference:', targetLanguage);
        } 
        // Priority 2: Browser language
        else if (supportedLanguages.includes(browserLanguage)) {
          targetLanguage = browserLanguage;
          localStorage.setItem('quickutil_preferred_locale', targetLanguage);
          console.log('🌍 PDF COMPRESS DEBUG - Using browser language:', targetLanguage);
        }
        // Priority 3: Check Accept-Language header languages
        else {
          const acceptLanguages = navigator.languages || [];
          for (const lang of acceptLanguages) {
            const shortLang = lang.slice(0, 2).toLowerCase();
            if (supportedLanguages.includes(shortLang)) {
              targetLanguage = shortLang;
              localStorage.setItem('quickutil_preferred_locale', targetLanguage);
              console.log('🌍 PDF COMPRESS DEBUG - Using Accept-Language:', targetLanguage);
              break;
            }
          }
        }
        
        // Redirect to appropriate language
        const newPath = `/${targetLanguage}${currentPath}`;
        console.log('🌍 PDF COMPRESS DEBUG - Redirecting:', {
          from: currentPath,
          to: newPath,
          targetLanguage,
          reason: preferredLanguage ? 'stored-preference' : 'browser-detection'
        });
        window.location.href = newPath;
      } else {
        // Log current locale validation
        console.log('🌍 PDF COMPRESS DEBUG - Locale already in path:', {
          currentPath,
          detectedLocale: locale,
          isSupported: supportedLanguages.includes(locale)
        });
        
        // Store current locale as preference
        if (supportedLanguages.includes(locale)) {
          localStorage.setItem('quickutil_preferred_locale', locale);
        }
      }
    };

    detectAndRedirectLanguage();
  }, [locale]);
  
  // Refs for auto-scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Component state
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResultDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Enhanced debug logging with step tracking
  useEffect(() => {
    console.log('📄 PDF COMPRESS DEBUG - Complete Translation Analysis:');
    console.log('  =====================================');
    console.log('  - Current locale:', locale);
    console.log('  - Current step:', currentStep);
    console.log('  - Auto compression enabled:', true);
    console.log('  - Browser Info:', {
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
      browserLanguages: navigator.languages,
      timestamp: new Date().toISOString(),
      currentURL: window.location.href,
      referrer: document.referrer
    });
    console.log('  - Step-specific texts (DE):', {
      step1: getText('pdfCompress.step1', getFallbackText('Dosya Yükle', 'Upload File', 'Subir Archivo', 'Télécharger Fichier', 'Datei hochladen')),
      step2: getText('pdfCompress.step2', getFallbackText('AI Sıkıştırma', 'AI Compression', 'Compresión con IA', 'Compression IA', 'KI-Komprimierung')),
      step3: getText('pdfCompress.step3', getFallbackText('İndir', 'Download', 'Descargar', 'Télécharger', 'Herunterladen')),
      uploadTitle: getText('pdfCompress.uploadTitle', getFallbackText('PDF Dosyanızı Sürükleyin', 'Drag Your PDF File', 'Arrastra tu archivo PDF', 'Glissez votre fichier PDF', 'Ziehen Sie Ihre PDF-Datei hierher')),
      processingTitle: getText('pdfCompress.processingTitle', getFallbackText('AI Sıkıştırma Devam Ediyor', 'AI Compression in Progress', 'Compresión con IA en Progreso', 'Compression IA en Cours', 'KI-Komprimierung läuft')),
      processingDesc: getText('pdfCompress.processingDescription', getFallbackText('Yapay zeka dosyanızı optimize ediyor...', 'Artificial intelligence is optimizing your file...', 'La inteligencia artificial está optimizando tu archivo...', 'L\'intelligence artificielle optimise votre fichier...', 'Künstliche Intelligenz optimiert Ihre Datei...')),
      successTitle: getText('pdfCompress.successTitle', getFallbackText('Sıkıştırma Tamamlandı!', 'Compression Completed!', '¡Compresión Completada!', 'Compression Terminée!', 'Erfolgreich komprimiert!'))
    });
    console.log('  - User interaction context:', {
      fileSelected: !!selectedFile,
      isCompressing: isCompressing,
      hasResult: !!compressionResult,
      hasError: !!error
    });
    console.log('  =====================================');
  }, [locale, currentStep, selectedFile, isCompressing, compressionResult, error]);

  // Auto-scroll to current step with logging
  useEffect(() => {
    console.log('📄 PDF COMPRESS DEBUG - Step Change Detected:', {
      currentStep,
      locale,
      timestamp: new Date().toISOString(),
      fileInfo: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      } : null,
      processingStatus: isCompressing,
      hasResult: !!compressionResult,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });

    const scrollToStep = () => {
      let targetRef;
      let stepName;
      switch (currentStep) {
        case 'upload':
          targetRef = uploadRef;
          stepName = 'upload-section';
          break;
        case 'processing':
          targetRef = processingRef;
          stepName = 'processing-section';
          break;
        case 'result':
          targetRef = resultRef;
          stepName = 'result-section';
          break;
      }
      
      console.log('📄 PDF COMPRESS DEBUG - Auto-scroll triggered:', {
        targetStep: currentStep,
        targetSection: stepName,
        timestamp: new Date().toISOString()
      });
      
      if (targetRef?.current) {
        setTimeout(() => {
          targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    scrollToStep();
  }, [currentStep, locale, selectedFile, isCompressing, compressionResult]);

  // Handle file selection with auto compression and detailed logging
  const handleFileSelect = async (file: File) => {
    if (!file) {
      console.log('📄 PDF COMPRESS DEBUG - No file selected:', {
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log('📄 PDF COMPRESS DEBUG - File Selection Event:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      locale,
      timestamp: new Date().toISOString(),
      action: 'file-selected'
    });
    
    setError(null);
    
    // File size limit
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      const errorMsg = getText('errors.pdfCompress.fileSizeLimit', 'Dosya boyutu 20MB dan büyük olamaz');
      console.log('📄 PDF COMPRESS DEBUG - File size limit exceeded:', {
        fileName: file.name,
        fileSize: file.size,
        maxSize,
        errorMessage: errorMsg,
        timestamp: new Date().toISOString()
      });
      setError(errorMsg);
      return;
    }
    
    setSelectedFile(file);
    
    console.log('📄 PDF COMPRESS DEBUG - File accepted, starting auto-compression:', {
      fileName: file.name,
      fileSize: file.size,
      autoCompressionDelay: 800,
      timestamp: new Date().toISOString()
    });
    
    // Auto-start compression with AI optimization
    setTimeout(async () => {
      await handleCompress(file);
    }, 800);
  };

  // Handle compression with AI auto mode and detailed logging
  const handleCompress = async (file?: File) => {
    const fileToCompress = file || selectedFile;
    if (!fileToCompress) {
      console.log('📄 PDF COMPRESS DEBUG - Compression blocked, no file:', {
        hasFile: !!fileToCompress,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log('📄 PDF COMPRESS DEBUG - Starting compression process:', {
      fileName: fileToCompress.name,
      fileSize: fileToCompress.size,
      fileType: fileToCompress.type,
      locale,
      timestamp: new Date().toISOString(),
      action: 'compression-start'
    });
    
    setIsCompressing(true);
    setError(null);
    setCurrentStep('processing');
    setCompressionProgress(0);
    
    const startTime = Date.now();
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 80) return 80; // Stop at 80% until server responds
          return prev + 15;
        });
      }, 500);

      // Auto AI compression with optimized quality
      const compressionQuality = 'medium' as const; // AI optimized quality

      console.log('📄 PDF COMPRESS DEBUG - AI Compression v3.0 - Auto Mode:', {
        fileName: fileToCompress.name,
        aiQuality: 'optimized',
        compressionLevel: compressionQuality,
        timestamp: new Date().toISOString()
      });
      
      // Call PDF Compression API
      const result: CompressionResult = await compressPDF(fileToCompress, {
        quality: compressionQuality,
        fileName: fileToCompress.name
      });
      
      // Clear progress and set to 100%
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      console.log('📄 PDF COMPRESS DEBUG - Compression completed successfully:', {
        fileName: fileToCompress.name,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: ((result.originalSize - result.compressedSize) / result.originalSize) * 100,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        action: 'compression-completed'
      });
      
      // Set result data
      const compressionRatio = ((result.originalSize - result.compressedSize) / result.originalSize) * 100;
      
      const resultData: CompressionResultDisplay = {
        compressedBlob: result.compressedBlob,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio,
        processingTime: result.processingTime || 0,
        downloadUrl: result.downloadUrl || URL.createObjectURL(result.compressedBlob)
      };
      
      setCompressionResult(resultData);
      setCurrentStep('result');
      
    } catch (error: any) {
      console.error('📄 PDF COMPRESS DEBUG - Compression failed:', {
        error,
        fileName: fileToCompress.name,
        fileSize: fileToCompress.size,
        fileType: fileToCompress.type,
        processingTime: Date.now() - startTime,
        locale,
        timestamp: new Date().toISOString(),
        action: 'compression-error'
      });
      setError(getText('errors.pdfCompress.compressionFailed', 'Sıkıştırma sırasında hata oluştu. Lütfen tekrar deneyin.'));
    } finally {
      setIsCompressing(false);
      console.log('📄 PDF COMPRESS DEBUG - Compression process finalized:', {
        fileName: fileToCompress.name,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        action: 'compression-finalized'
      });
    }
  };

  const handleReset = () => {
    console.log('📄 PDF COMPRESS DEBUG - Reset process initiated:', {
      currentStep,
      fileName: selectedFile?.name,
      hasResult: !!compressionResult,
      hasError: !!error,
      locale,
      timestamp: new Date().toISOString(),
      action: 'reset-process'
    });

    setCurrentStep('upload');
    setSelectedFile(null);
    setCompressionResult(null);
    setError(null);
    setCompressionProgress(0);
    setIsCompressing(false);
    
    console.log('📄 PDF COMPRESS DEBUG - Reset process completed:', {
      newStep: 'upload',
      timestamp: new Date().toISOString(),
      action: 'reset-completed'
    });
  };

  const getText = (key: string, fallback: string) => {
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || fallback;
    } catch {
      return fallback;
    }
  };

  // Helper function for multi-language fallbacks including French
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    console.log(`📄 PDF COMPRESS DEBUG - getFallbackText called for locale: ${locale}`);
    console.log(`  - TR: ${trText}`);
    console.log(`  - EN: ${enText}`);
    console.log(`  - ES: ${esText || 'not provided'}`);
    console.log(`  - FR: ${frText || 'not provided'}`);
    console.log(`  - DE: ${deText || 'not provided'}`);
    
    let result: string;
    switch (locale) {
      case 'tr': 
        result = trText;
        break;
      case 'en': 
        result = enText;
        break;
      case 'es': 
        result = esText || enText;
        break;
      case 'fr': 
        result = frText || enText;
        break;
      case 'de': 
        result = deText || enText;
        break;
      default: 
        result = enText; // Default to English for any other locales
        break;
    }
    
    console.log(`  - Final result for ${locale}: ${result}`);
    return result;
  };

  // Enhanced debug logging with locale and translation values
  useEffect(() => {
    console.log('📄 PDF COMPRESS DEBUG - Enhanced Translation System:');
    console.log('  - Current locale:', locale);
    console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
    console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
    console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
    console.log('  - Is French detected:', typeof navigator !== 'undefined' ? navigator.language.startsWith('fr') : false);
    
    console.log('📄 PDF COMPRESS DEBUG - Sample Translation Values:');
    console.log('  - Step 1 Text:', getText('pdfCompress.step1', getFallbackText('Dosya Yükle', 'Upload File', 'Subir Archivo', 'Télécharger Fichier')));
    console.log('  - Step 2 Text:', getText('pdfCompress.step2', getFallbackText('AI Sıkıştırma', 'AI Compression', 'Compresión con IA', 'Compression IA')));
    console.log('  - Step 3 Text:', getText('pdfCompress.step3', getFallbackText('İndir', 'Download', 'Descargar', 'Télécharger')));
    console.log('  - Title:', getText('pdfCompress.title', getFallbackText('AI PDF Sıkıştırma', 'AI PDF Compression', 'Compresión de PDF con IA', 'Compression PDF IA')));
    console.log('  - Success Title:', getText('pdfCompress.successTitle', getFallbackText('Sıkıştırma Tamamlandı!', 'Compression Completed!', '¡Compresión Completada!', 'Compression Terminée!')));
    console.log('  - Download Text:', getText('pdfCompress.downloadCompressed', getFallbackText('Sıkıştırılmış PDF İndir', 'Download Compressed PDF', 'Descargar PDF Comprimido', 'Télécharger PDF Comprimé')));
  }, [locale]);

  // Dropzone configuration with detailed logging
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      console.log('📄 PDF COMPRESS DEBUG - Dropzone Event:', {
        acceptedFiles: acceptedFiles.length,
        rejectedFiles: rejectedFiles.length,
        isDragActive,
        locale,
        timestamp: new Date().toISOString(),
        action: 'file-drop'
      });

      if (rejectedFiles.length > 0) {
        console.log('📄 PDF COMPRESS DEBUG - Files rejected:', {
          rejectedFiles: rejectedFiles.map(file => ({
            name: file.file.name,
            size: file.file.size,
            type: file.file.type,
            errors: file.errors.map(err => err.message)
          })),
          timestamp: new Date().toISOString()
        });
      }

      if (acceptedFiles[0]) {
        console.log('📄 PDF COMPRESS DEBUG - File accepted via dropzone:', {
          fileName: acceptedFiles[0].name,
          fileSize: acceptedFiles[0].size,
          fileType: acceptedFiles[0].type,
          timestamp: new Date().toISOString()
        });
        handleFileSelect(acceptedFiles[0]);
      }
    },
    onDragEnter: () => {
      console.log('📄 PDF COMPRESS DEBUG - Drag enter:', {
        locale,
        timestamp: new Date().toISOString(),
        action: 'drag-enter'
      });
    },
    onDragLeave: () => {
      console.log('📄 PDF COMPRESS DEBUG - Drag leave:', {
        locale,
        timestamp: new Date().toISOString(),
        action: 'drag-leave'
      });
    },
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6">
            <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium text-sm">
              {getText('pdfCompress.aiCompressionBadge', getFallbackText('AI PDF Sıkıştırma', 'AI PDF Compression', 'Compresión de PDF con IA', 'Compression PDF IA', 'KI PDF-Komprimierung'))}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {getText('pdfCompress.title', getFallbackText('AI PDF Sıkıştırma', 'AI PDF Compression', 'Compresión de PDF con IA', 'Compression PDF IA', 'KI PDF-Komprimierung'))}
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {getText('pdfCompress.subtitle', getFallbackText(
              'Yapay zeka ile PDF dosyalarınızı optimize edin. En iyi kalite ve boyut dengesini otomatik olarak bulur.',
              'Optimize your PDF files with artificial intelligence. Automatically finds the best balance between quality and size.',
              'Optimiza tus archivos PDF con inteligencia artificial. Encuentra automáticamente el mejor equilibrio entre calidad y tamaño.',
              'Optimisez vos fichiers PDF avec l\'intelligence artificielle. Trouve automatiquement le meilleur équilibre entre qualité et taille.'
            ))}
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {/* Step 1: Upload */}
            <div className={`flex items-center ${currentStep === 'upload' ? 'text-purple-600' : currentStep === 'processing' || currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'upload' ? 'border-purple-600 bg-purple-50' : currentStep === 'processing' || currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'processing' || currentStep === 'result' ? (
                  <DocumentCheckIcon className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">1</span>
                )}
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step1', getFallbackText('Dosya Yükle', 'Upload File', 'Subir Archivo', 'Télécharger Fichier', 'Datei hochladen'))}
              </span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === 'processing' || currentStep === 'result' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            {/* Step 2: Processing */}
            <div className={`flex items-center ${currentStep === 'processing' ? 'text-purple-600' : currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'processing' ? 'border-purple-600 bg-purple-50' : currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                {currentStep === 'result' ? (
                  <DocumentCheckIcon className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">2</span>
                )}
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step2', getFallbackText('AI Sıkıştırma', 'AI Compression', 'Compresión con IA', 'Compression IA', 'KI-Komprimierung'))}
              </span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === 'result' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            {/* Step 3: Result */}
            <div className={`flex items-center ${currentStep === 'result' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'result' ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}>
                <span className="font-semibold">3</span>
              </div>
              <span className="ml-3 font-medium">
                {getText('pdfCompress.step3', getFallbackText('İndir', 'Download', 'Descargar', 'Télécharger', 'Herunterladen'))}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div ref={uploadRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div 
                {...getRootProps()} 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-purple-500 bg-purple-50 scale-105' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                }`}
              >
                <input {...getInputProps()} />
                
                {/* Upload Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <ArrowUpTrayIcon className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.uploadTitle', getFallbackText('PDF Dosyanızı Sürükleyin', 'Drag Your PDF File', 'Arrastra tu archivo PDF', 'Glissez votre fichier PDF', 'Ziehen Sie Ihre PDF-Datei hierher'))}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg">
                  {getText('pdfCompress.uploadDesc', getFallbackText('veya tıklayarak dosya seçin', 'or click to select file', 'o haz clic para seleccionar archivo', 'ou cliquez pour sélectionner le fichier', 'oder klicken Sie, um eine Datei auszuwählen'))}
                </p>
                
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  {getText('pdfCompress.selectFile', getFallbackText('Dosya Seç', 'Select File', 'Seleccionar Archivo', 'Sélectionner Fichier', 'Datei auswählen'))}
                </button>
                
                <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center">
                    <DocumentCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                    {getText('pdfCompress.maxFileSizeText', getFallbackText('Maksimum 20MB PDF dosyası', 'Maximum 20MB PDF file', 'Archivo PDF máximo 20MB', 'Fichier PDF maximum 20MB', 'Maximale Dateigröße 20MB PDF'))}
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                    {getText('pdfCompress.aiOptimized', getFallbackText('AI Optimize Edilmiş', 'AI Optimized', 'Optimizado con IA', 'Optimisé par IA', 'KI-Optimiert'))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <div ref={processingRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                  <SparklesIcon className="h-12 w-12 text-purple-600 animate-pulse" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.processingTitle', getFallbackText('AI Sıkıştırma Devam Ediyor', 'AI Compression in Progress', 'Compresión con IA en Progreso', 'Compression IA en Cours'))}
                </h3>
                
                <p className="text-gray-600 text-lg">
                  {getText('pdfCompress.processingDescription', getFallbackText('Yapay zeka dosyanızı optimize ediyor...', 'Artificial intelligence is optimizing your file...', 'La inteligencia artificial está optimizando tu archivo...', 'L\'intelligence artificielle optimise votre fichier...', 'Künstliche Intelligenz optimiert Ihre Datei...'))}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${compressionProgress}%` }}
                ></div>
              </div>
              
              <p className="text-purple-600 font-semibold text-lg">
                %{compressionProgress}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {currentStep === 'result' && compressionResult && (
          <div ref={resultRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <DocumentCheckIcon className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {getText('pdfCompress.successTitle', getFallbackText('Sıkıştırma Tamamlandı!', 'Compression Completed!', '¡Compresión Completada!', 'Compression Terminée!'))}
                </h3>
                
                <p className="text-gray-600 text-lg">
                  {getText('pdfCompress.successDesc', getFallbackText('PDF dosyanız başarıyla optimize edildi.', 'Your PDF file has been successfully optimized.', 'Tu archivo PDF ha sido optimizado exitosamente.', 'Votre fichier PDF a été optimisé avec succès.'))}
                </p>
              </div>
              
              {/* Compression Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.originalSize', getFallbackText('Orijinal Boyut', 'Original Size', 'Tamaño Original', 'Taille Originale'))}
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {(compressionResult.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.compressedSize', getFallbackText('Sıkıştırılmış Boyut', 'Compressed Size', 'Tamaño Comprimido', 'Taille Comprimée'))}
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(compressionResult.compressedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {getText('pdfCompress.savedSpace', getFallbackText('Tasarruf Edilen', 'Space Saved', 'Espacio Ahorrado', 'Espace Économisé'))}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    %{Math.round(compressionResult.compressionRatio)}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={compressionResult.downloadUrl}
                  download={selectedFile?.name?.replace('.pdf', '_compressed.pdf')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  {getText('pdfCompress.downloadCompressed', getFallbackText('Sıkıştırılmış PDF İndir', 'Download Compressed PDF', 'Descargar PDF Comprimido', 'Télécharger PDF Comprimé'))}
                </a>
                
                <button
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {getText('pdfCompress.compressAnother', getFallbackText('Başka Dosya Sıkıştır', 'Compress Another File', 'Comprimir Otro Archivo', 'Compresser un Autre Fichier'))}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 text-red-600 hover:text-red-800 font-medium"
            >
              {getText('common.dismiss', getFallbackText('Kapat', 'Close', 'Cerrar', 'Fermer'))}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 