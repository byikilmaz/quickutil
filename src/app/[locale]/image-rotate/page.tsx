'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowPathIcon, SparklesIcon, PhotoIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { getTranslations } from '@/lib/translations';
import { 
  rotateImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult
} from '@/lib/imageUtils';

interface RotateResult {
  originalFile: File;
  rotatedBlob: Blob;
  originalSize: number;
  rotatedSize: number;
  rotationAngle: number;
  downloadUrl: string;
}

interface ImageRotateProps {
  params: Promise<{ locale: string }>;
}

export default async function ImageRotate({ params }: ImageRotateProps) {
  const { locale } = await params;
  
  return <ImageRotateContent locale={locale} />;
}

function ImageRotateContent({ locale }: { locale: string }) {
  const translations = getTranslations(locale);
  
  // Multi-language support via getText system
  
  const getText = (key: string, fallback: string) => {
    // Handle flat string keys directly (for imageRotate, etc.)
    const flatValue = (translations as any)[key];
    if (flatValue) {
      console.log('🔍 DEBUG - Locale:', locale, 'Key:', key, 'Value:', flatValue, 'Fallback:', fallback);
      return flatValue;
    }
    
    // Handle nested object keys (original behavior)
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    
    console.log('🔍 DEBUG - Locale:', locale, 'Key:', key, 'Value:', value, 'Fallback:', fallback);
    
    return value || fallback;
  };

  // Dynamic fallbacks based on locale with Spanish support
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    const isCompletionMessage = trText.includes('döndürme işlemi');
    
    if (isCompletionMessage) {
      console.log(`🔄 IMAGE ROTATE DEBUG - getFallbackText for COMPLETION MESSAGE:`, {
        locale,
        trText,
        enText,
        esText: esText || 'not provided',
        frText: frText || 'not provided',
        deText: deText || 'not provided'
      });
    }
    
    console.log(`🔄 IMAGE ROTATE DEBUG - getFallbackText called for locale: ${locale}`);
    console.log(`  - TR: ${trText}`);
    console.log(`  - EN: ${enText}`);
    console.log(`  - ES: ${esText || 'not provided'}`);
    
    let result;
    switch (locale) {
      case 'tr': result = trText; break;
      case 'en': result = enText; break;
      case 'es': result = esText || enText; break;
      case 'fr': result = frText || enText; break;
      case 'de': result = deText || enText; break;
      case 'ar': result = enText; break; // Arabic fallback to English
      case 'ja': result = enText; break; // Japanese fallback to English
      case 'ko': result = enText; break; // Korean fallback to English
      default: result = enText; break;
    }
    
    if (isCompletionMessage) {
      console.log(`🔄 IMAGE ROTATE DEBUG - COMPLETION MESSAGE RESULT for locale ${locale}:`, result);
    }
    
    return result;
  };
  
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Step-based state like PDF convert
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [rotateResult, setRotateResult] = useState<RotateResult | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs for smooth scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-focus on upload area when page loads with step tracking
  useEffect(() => {
    console.log('🔄 IMAGE ROTATE DEBUG - Page Load Auto-Focus:', {
      currentStep,
      locale,
      timestamp: new Date().toISOString(),
      action: 'auto-focus-upload'
    });
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [currentStep, locale]);

  // Step change tracking system
  useEffect(() => {
    console.log('🔄 IMAGE ROTATE DEBUG - Step Change Detected:', {
      currentStep,
      locale,
      timestamp: new Date().toISOString(),
      fileInfo: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : null,
      rotationAngle: rotation,
      processingStatus: isProcessing,
      hasResult: !!rotateResult,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
    
    // Track step-specific actions
    switch (currentStep) {
      case 'upload':
        console.log('🔄 IMAGE ROTATE DEBUG - Upload Step Active:', {
          action: 'awaiting-file-selection',
          supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
        });
        break;
      case 'configure':
        console.log('🔄 IMAGE ROTATE DEBUG - Configure Step Active:', {
          action: 'file-configuration',
          fileName: file?.name,
          fileSize: file?.size,
          originalDimensions,
          currentRotation: rotation
        });
        break;
      case 'processing':
        console.log('🔄 IMAGE ROTATE DEBUG - Processing Step Active:', {
          action: 'image-processing',
          fileName: file?.name,
          rotationAngle: rotation,
          processingProgress: processingProgress
        });
        break;
      case 'result':
        console.log('🔄 IMAGE ROTATE DEBUG - Result Step Active:', {
          action: 'show-result',
          fileName: file?.name,
          rotationApplied: rotation,
          resultAvailable: !!rotateResult,
          originalSize: rotateResult?.originalSize,
          rotatedSize: rotateResult?.rotatedSize
        });
        break;
    }
  }, [currentStep, locale, file, rotation, isProcessing, rotateResult, processingProgress, originalDimensions]);

  // Dropzone configuration with detailed logging
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) {
        console.log('🔄 IMAGE ROTATE DEBUG - No file selected in drop:', {
          acceptedFiles,
          timestamp: new Date().toISOString()
        });
        return;
      }

      console.log('🔄 IMAGE ROTATE DEBUG - File Drop Event:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        locale,
        timestamp: new Date().toISOString(),
        action: 'file-dropped'
      });

      setFile(file);
      
      try {
        const dimensions = await getImageDimensions(file);
        setOriginalDimensions(dimensions);
        
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        console.log('🔄 IMAGE ROTATE DEBUG - File Processing Success:', {
          fileName: file.name,
          dimensions,
          previewUrl: url,
          nextStep: 'configure',
          timestamp: new Date().toISOString()
        });
        
        setCurrentStep('configure');
        
        // Fixed: Single scroll to configure section with center positioning
        setTimeout(() => {
          configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          configureRef.current?.focus();
          console.log('🔄 IMAGE ROTATE DEBUG - Auto-scroll to configure:', {
            action: 'scroll-to-configure',
            timestamp: new Date().toISOString()
          });
        }, 300);
      } catch (error) {
        console.error('🔄 IMAGE ROTATE DEBUG - Error getting image dimensions:', {
          error,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          timestamp: new Date().toISOString()
        });
      }
    },
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
    },
    multiple: false
  });

  // Handle rotation with detailed logging
  const handleRotate = async () => {
    if (!file || rotation === 0) {
      console.log('🔄 IMAGE ROTATE DEBUG - Rotation blocked:', {
        hasFile: !!file,
        rotation,
        reason: !file ? 'no-file' : 'no-rotation',
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.log('🔄 IMAGE ROTATE DEBUG - Starting rotation process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      rotationAngle: rotation,
      locale,
      timestamp: new Date().toISOString(),
      action: 'rotation-start'
    });

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    // Scroll to processing section with better focus
    setTimeout(() => {
      processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      processingRef.current?.focus();
      console.log('🔄 IMAGE ROTATE DEBUG - Auto-scroll to processing:', {
        action: 'scroll-to-processing',
        timestamp: new Date().toISOString()
      });
    }, 100);

    const startTime = Date.now();

    try {
      // Extended progress simulation for better visibility
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 12;
        });
      }, 150);

      // Increased processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

      const result = await rotateImage(file, { angle: rotation });
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      console.log('🔄 IMAGE ROTATE DEBUG - Rotation process completed:', {
        fileName: file.name,
        rotationAngle: rotation,
        originalSize: file.size,
        rotatedSize: result.file.size,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        action: 'rotation-completed'
      });

      const rotateResult: RotateResult = {
        originalFile: file,
        rotatedBlob: result.file,
        originalSize: file.size,
        rotatedSize: result.file.size,
        rotationAngle: rotation,
        downloadUrl: URL.createObjectURL(result.file)
      };

      setRotateResult(rotateResult);
      
      // Brief delay before showing result
      setTimeout(() => {
        setCurrentStep('result');
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('🔄 IMAGE ROTATE DEBUG - Auto-scroll to result:', {
            action: 'scroll-to-result',
            timestamp: new Date().toISOString()
          });
        }, 200);
      }, 500);

      // Track activity
      if (user) {
        try {
          const processingTime = Date.now() - startTime;
          await ActivityTracker.createActivity(user.uid, {
            type: 'image_rotate',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: result.file.size,
            status: 'success',
            category: 'Image',
            processingTime,
            downloadUrl: rotateResult.downloadUrl
          });
        } catch (error) {
          console.error('Activity tracking error:', error);
        }
      }

    } catch (error) {
      console.error('🔄 IMAGE ROTATE DEBUG - Image rotation error:', {
        error,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        rotationAngle: rotation,
        processingTime: Date.now() - startTime,
        locale,
        timestamp: new Date().toISOString(),
        action: 'rotation-error'
      });
      setCurrentStep('configure');
    } finally {
      setIsProcessing(false);
      console.log('🔄 IMAGE ROTATE DEBUG - Rotation process finalized:', {
        fileName: file.name,
        rotationAngle: rotation,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        action: 'rotation-finalized'
      });
    }
  };

  // Reset function with detailed logging
  const resetProcess = () => {
    console.log('🔄 IMAGE ROTATE DEBUG - Reset process initiated:', {
      currentStep,
      fileName: file?.name,
      rotationAngle: rotation,
      hasResult: !!rotateResult,
      locale,
      timestamp: new Date().toISOString(),
      action: 'reset-process'
    });

    setCurrentStep('upload');
    setFile(null);
    setRotation(0);
    setRotateResult(null);
    setOriginalDimensions(null);
    setProcessingProgress(0);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      console.log('🔄 IMAGE ROTATE DEBUG - Preview URL revoked:', {
        action: 'url-revoked',
        timestamp: new Date().toISOString()
      });
    }

    // Scroll back to upload
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      console.log('🔄 IMAGE ROTATE DEBUG - Auto-scroll to upload after reset:', {
        action: 'scroll-to-upload-reset',
        timestamp: new Date().toISOString()
      });
    }, 100);
    
    console.log('🔄 IMAGE ROTATE DEBUG - Reset process completed:', {
      newStep: 'upload',
      timestamp: new Date().toISOString(),
      action: 'reset-completed'
    });
  };

  // Multi-language text variables (TR, FR, ES, EN) with dynamic fallbacks
  const badgeText = getText('imageRotate.badge', getFallbackText('500K+ Resim Döndürüldü • AI Destekli', '500K+ Images Rotated • AI Powered', '500K+ Imágenes Rotadas • AI Soportado', '500K+ Images Rotated • AI Powered', '500K+ Imágenes Rotadas • AI Soportado'));
  const titleText = getText('imageRotate.title', getFallbackText('🔄 Resim Döndürme', '🔄 Image Rotate', '🔄 Rotar Imagen', '🔄 Rotar Imagen', '🔄 Rotar Imagen'));
  const descriptionText = getText('imageRotate.description', getFallbackText('Resimlerinizi istediğiniz açıda kolayca döndürün. Güçlü işleme teknolojimizle kalite kaybı olmadan döndürme yapın.', 'Easily rotate your images to any angle. Rotate without quality loss using our powerful processing technology.', 'Gira tus imágenes a cualquier ángulo con facilidad. Gira sin pérdida de calidad usando nuestra tecnología de procesamiento potente.', 'Gira tus imágenes a cualquier ángulo con facilidad. Gira sin pérdida de calidad usando nuestra tecnología de procesamiento potente.', 'Gira tus imágenes a cualquier ángulo con facilidad. Gira sin pérdida de calidad usando nuestra tecnología de procesamiento potente.'));
  const trustNoQualityLoss = getText('imageRotate.trust.noQualityLoss', getFallbackText('Kalite Kaybı Yok', 'No Quality Loss', 'Sin pérdida de calidad', 'Sin pérdida de calidad', 'Sin pérdida de calidad'));
  const trustAllFormats = getText('imageRotate.trust.allFormats', getFallbackText('Tüm Formatlar', 'All Formats', 'Todos los formatos', 'Todos los formatos', 'Todos los formatos'));
  const trustSecureFast = getText('imageRotate.trust.secureFast', getFallbackText('Güvenli & Hızlı', 'Secure & Fast', 'Seguro y rápido', 'Seguro y rápido', 'Seguro y rápido'));

  // Step 1 - Upload
  const uploadTitle = getText('imageRotate.upload.title', getFallbackText('Resim Yükleyin', 'Upload Image', 'Subir Imagen'));
  const uploadDescription = getText('imageRotate.upload.description', getFallbackText('JPEG, PNG, WebP formatlarında resimlerinizi yükleyin', 'Upload your images in JPEG, PNG, WebP formats', 'Sube tus imágenes en formatos JPEG, PNG, WebP'));
  const dropText = getText('imageRotate.upload.dropText', getFallbackText('Dosyayı Bırakın', 'Drop File', 'Soltar Archivo'));
  const uploadText = getText('imageRotate.upload.uploadText', getFallbackText('Resim Yükleyin', 'Upload Image', 'Subir Imagen'));
  const dragOrSelect = getText('imageRotate.upload.dragOrSelect', getFallbackText('Dosyayı sürükleyip bırakın veya seçin', 'Drag and drop or select file', 'Arrastra y suelta o selecciona archivo'));
  const selectFile = getText('imageRotate.upload.selectFile', getFallbackText('Dosya Seçin', 'Select File', 'Seleccionar Archivo'));
  const fileTypes = getText('imageRotate.upload.fileTypes', getFallbackText('JPEG, PNG, WebP • Max 50MB', 'JPEG, PNG, WebP • Max 50MB', 'JPEG, PNG, WebP • Max 50MB'));

  // Step 2 - Configure
  const previewTitle = getText('imageRotate.configure.previewTitle', getFallbackText('Önizleme', 'Preview', 'Vista Previa'));
  const settingsTitle = getText('imageRotate.configure.settingsTitle', getFallbackText('Döndürme Ayarları', 'Rotation Settings', 'Configuraciones de Rotación'));
  const backButton = getText('imageRotate.configure.backButton', getFallbackText('Geri', 'Back', 'Atrás'));
  const quickRotationTitle = getText('imageRotate.configure.quickRotationTitle', getFallbackText('Hızlı Döndürme', 'Quick Rotation', 'Rotación Rápida'));
  const rotate90Right = getText('imageRotate.configure.rotate90Right', getFallbackText('90° Sağa', '90° Right', '90° Derecha'));
  const rotate180 = getText('imageRotate.configure.rotate180', getFallbackText('180° Ters', '180° Flip', '180° Voltear'));
  const rotate90Left = getText('imageRotate.configure.rotate90Left', getFallbackText('90° Sola', '90° Left', '90° Izquierda'));
  const resetAngle = getText('imageRotate.configure.resetAngle', getFallbackText('Sıfırla', 'Reset', 'Resetear'));
  const customAngleTitle = getText('imageRotate.configure.customAngleTitle', getFallbackText('Özel Açı', 'Custom Angle', 'Ángulo Personalizado'));
  const currentAngle = getText('imageRotate.configure.currentAngle', getFallbackText('Döndürme Açısı:', 'Rotation Angle:', 'Ángulo de Rotación:'));
  const anglePlaceholder = getText('imageRotate.configure.anglePlaceholder', getFallbackText('Açı (0-360°)', 'Angle (0-360°)', 'Ángulo (0-360°)'));
  const startRotation = getText('imageRotate.configure.startRotation', getFallbackText('🚀 Döndürmeyi Başlat', '🚀 Start Rotation', '🚀 Iniciar Rotación'));

  // Step 3 - Processing
  const processingTitle = getText('imageRotate.processing.title', getFallbackText('Resim Döndürülüyor...', 'Rotating Image...', 'Rotando Imagen...', 'Rotando Imagen...', 'Rotando Imagen...'));
  const processingDescription = getText('imageRotate.processing.description', getFallbackText('AI destekli teknolojimizle resminiz kalite kaybı olmadan döndürülüyor', 'Your image is being rotated without quality loss using our AI-powered technology', 'Tu imagen está siendo rotada sin pérdida de calidad usando nuestra tecnología de procesamiento potente.', 'Tu imagen está siendo rotada sin pérdida de calidad usando nuestra tecnología de procesamiento potente.', 'Tu imagen está siendo rotada sin pérdida de calidad usando nuestra tecnología de procesamiento potente.'));
  const completed = getText('imageRotate.processing.completed', getFallbackText('tamamlandı', 'completed', 'completado', 'completado', 'completado'));
  const stepAnalysis = getText('imageRotate.processing.stepAnalysis', getFallbackText('Resim Analizi', 'Image Analysis', 'Análisis de imagen', 'Análisis de imagen', 'Análisis de imagen'));
  const stepRotating = getText('imageRotate.processing.stepRotating', getFallbackText('Döndürülüyor', 'Rotating', 'Rotando', 'Rotando', 'Rotando'));
  const stepOptimizing = getText('imageRotate.processing.stepOptimizing', getFallbackText('Optimize Ediliyor', 'Optimizing', 'Optimizando', 'Optimizando', 'Optimizando'));

  // Step 4 - Result
  const successTitle = getText('imageRotate.result.successTitle', getFallbackText('Döndürme Tamamlandı', 'Rotation Complete', 'Rotación Completa'));
  const successSubtitle = getText('imageRotate.result.successSubtitle', getFallbackText('Resminiz Başarıyla Döndürüldü!', 'Your Image Has Been Successfully Rotated!', '¡Tu Imagen Ha Sido Rotada Exitosamente!'));
  const beforeTitle = getText('imageRotate.result.beforeTitle', getFallbackText('Öncesi', 'Before', 'Antes'));
  const afterTitle = getText('imageRotate.result.afterTitle', getFallbackText('Sonrası', 'After', 'Después'));
  const rotatedImageTitle = getText('imageRotate.result.rotatedImageTitle', getFallbackText('Döndürülmüş Resim', 'Rotated Image', 'Imagen Rotada'));
  const rotatedAngle = getText('imageRotate.result.rotatedAngle', getFallbackText('döndürüldü', 'rotated', 'rotada'));
  const downloadButton = getText('imageRotate.result.downloadButton', getFallbackText('Döndürülmüş Resmi İndir', 'Download Rotated Image', 'Descargar Imagen Rotada'));
  const newImageButton = getText('imageRotate.result.newImageButton', getFallbackText('Yeni Resim Döndür', 'Rotate New Image', 'Rotar Nueva Imagen'));

  // Enhanced debug logging with browser detection and step tracking
  useEffect(() => {
    console.log('🔄 IMAGE ROTATE DEBUG - Complete Translation Analysis:');
    console.log('  =====================================');
    console.log('  - Current locale:', locale);
    console.log('  - Current step:', currentStep);
    console.log('  - Badge Text (FR):', badgeText);
    console.log('  - Title (FR):', titleText);
    console.log('  - Upload Title (FR):', uploadTitle);
    console.log('  - Upload Description (FR):', uploadDescription);
    console.log('  - Configure Settings (FR):', settingsTitle);
    console.log('  - Processing Title (FR):', processingTitle);
    console.log('  - Processing Description (FR):', processingDescription);
    console.log('  - Success Title (FR):', successTitle);
    console.log('  - Download Button (FR):', downloadButton);
    console.log('  - Browser Info:', {
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
      browserLanguages: navigator.languages,
      timestamp: new Date().toISOString(),
      currentURL: window.location.href,
      referrer: document.referrer
    });
    console.log('  - Step-specific texts:', {
      stepAnalysis: stepAnalysis,
      stepRotating: stepRotating,
      stepOptimizing: stepOptimizing,
      previewTitle: previewTitle,
      settingsTitle: settingsTitle,
      backButton: backButton
    });
    console.log('  - User interaction context:', {
      fileSelected: !!file,
      rotationSet: rotation,
      isProcessing: isProcessing,
      hasResult: !!rotateResult
    });
    console.log('  =====================================');
  }, [locale, currentStep, badgeText, titleText, uploadTitle, uploadDescription, settingsTitle, processingTitle, processingDescription, successTitle, downloadButton, stepAnalysis, stepRotating, stepOptimizing, previewTitle, backButton, file, rotation, isProcessing, rotateResult]);

  // Enhanced browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`));
      
      console.log('🌍 IMAGE ROTATE DEBUG - Enhanced Browser Language Auto-Detection:', {
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
        
        console.log('🌍 IMAGE ROTATE DEBUG - Language Detection Process:', {
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
          console.log('🌍 IMAGE ROTATE DEBUG - Using stored preference:', targetLanguage);
        } 
        // Priority 2: Browser language
        else if (supportedLanguages.includes(browserLanguage)) {
          targetLanguage = browserLanguage;
          localStorage.setItem('quickutil_preferred_locale', targetLanguage);
          console.log('🌍 IMAGE ROTATE DEBUG - Using browser language:', targetLanguage);
        }
        // Priority 3: Check Accept-Language header languages
        else {
          const acceptLanguages = navigator.languages || [];
          for (const lang of acceptLanguages) {
            const shortLang = lang.slice(0, 2).toLowerCase();
            if (supportedLanguages.includes(shortLang)) {
              targetLanguage = shortLang;
              localStorage.setItem('quickutil_preferred_locale', targetLanguage);
              console.log('🌍 IMAGE ROTATE DEBUG - Using Accept-Language:', targetLanguage);
              break;
            }
          }
        }
        
        // Redirect to appropriate language
        const newPath = `/${targetLanguage}${currentPath}`;
        console.log('🌍 IMAGE ROTATE DEBUG - Redirecting:', {
          from: currentPath,
          to: newPath,
          targetLanguage,
          reason: preferredLanguage ? 'stored-preference' : 'browser-detection'
        });
        window.location.href = newPath;
      } else {
        // Log current locale validation
        console.log('🌍 IMAGE ROTATE DEBUG - Locale already in path:', {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-purple-300/20 rounded-full animate-pulse"
            style={{
              left: `${5 + (i * 4.5) % 95}%`,
              top: `${10 + (i * 7) % 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
      
      {/* SEO */}
      <StructuredData type="website" />
      
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Enhanced Hero Section */}
          <div className="text-center py-16 relative">
            {/* AI Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <SparklesIcon className="h-4 w-4 text-purple-600 mr-2 animate-pulse" />
              {badgeText}
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                {titleText}
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              {descriptionText}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent font-medium">
                  {trustNoQualityLoss}
                </span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent font-medium">
                  {trustAllFormats}
                </span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <CheckCircleIcon className="h-4 w-4 text-purple-500 mr-2" />
                <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent font-medium">
                  {trustSecureFast}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 1: UPLOAD */}
          <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
            currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 relative overflow-hidden">
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-xl"></div>

              <div className="text-center mb-8 relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {uploadTitle}
                </h2>
                <p className="text-gray-600 text-lg">
                  {uploadDescription}
                </p>
              </div>

              {/* Enhanced Upload Area */}
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50 scale-105'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                }`}
              >
                <input {...getInputProps()} />
                
                {/* Orbital Animation Container */}
                <div className="relative inline-block mb-6">
                  {/* Main Icon */}
                  <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <PhotoIcon className="h-12 w-12 text-white" />
                  </div>
                  
                  {/* Orbital Rings */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="w-32 h-32 border-2 border-purple-300/30 rounded-full absolute -inset-4"></div>
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
                    <div className="w-40 h-40 border-2 border-pink-300/20 rounded-full absolute -inset-8"></div>
                  </div>
                  
                  {/* Floating Sparkles */}
                  <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
                  <div className="absolute -bottom-2 -left-2 text-green-400 animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {isDragActive ? dropText : uploadText}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {dragOrSelect}
                </p>
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-3 font-semibold">
                  <CloudArrowUpIcon className="h-6 w-6" />
                  <span>{selectFile}</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  {fileTypes}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: CONFIGURE */}
          {currentStep === 'configure' && file && (
            <div ref={configureRef} className="py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="lg:flex">
                  {/* Left Panel - Preview (1/3) */}
                  <div className="lg:w-1/3 p-8 bg-gray-50/50">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <PhotoIcon className="h-6 w-6 text-purple-600 mr-2" />
                      {previewTitle}
                    </h3>
                    
                    {previewUrl && (
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-contain rounded-xl transition-transform duration-300"
                          style={{ transform: `rotate(${rotation}deg)` }}
                        />
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(file.size)} • {originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Panel - Settings (2/3) */}
                  <div className="lg:w-2/3 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {settingsTitle}
                      </h3>
                      <button
                        onClick={resetProcess}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        {backButton}
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Quick Rotation Buttons */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          {quickRotationTitle}
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { angle: 90, label: rotate90Right, icon: '↻' },
                            { angle: 180, label: rotate180, icon: '↺' },
                            { angle: 270, label: rotate90Left, icon: '↺' },
                            { angle: 0, label: resetAngle, icon: '⟲' }
                          ].map((option) => (
                            <button
                              key={option.angle}
                              onClick={() => setRotation(option.angle)}
                              className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                                rotation === option.angle
                                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 text-purple-800 shadow-lg'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <div className="text-2xl mb-2">{option.icon}</div>
                              <div className="font-medium">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Angle */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          {customAngleTitle}
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {currentAngle} {rotation}°
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={rotation}
                              onChange={(e) => setRotation(parseInt(e.target.value))}
                              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>0°</span>
                              <span>90°</span>
                              <span>180°</span>
                              <span>270°</span>
                              <span>360°</span>
                            </div>
                          </div>
                          
                          <input
                            type="number"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                            min="0"
                            max="360"
                            placeholder={anglePlaceholder}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6">
                        <button
                          ref={processButtonRef}
                          onClick={handleRotate}
                          disabled={rotation === 0}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg flex items-center justify-center space-x-3"
                        >
                          <ArrowPathIcon className="h-6 w-6" />
                          <span>{startRotation}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING */}
          {currentStep === 'processing' && (
            <div 
              ref={processingRef} 
              className="py-24 min-h-screen flex items-center justify-center"
              tabIndex={-1}
              style={{ outline: 'none' }}
            >
              <div className="max-w-3xl mx-auto text-center w-full">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-16 relative overflow-hidden">
                  
                  {/* Background gradient animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-purple-50/80 opacity-50"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="relative inline-block mb-8">
                      {/* Multiple Rotating Rings - Larger for better visibility */}
                      <div className="relative">
                        <div className="w-40 h-40 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                          <div className="w-full h-full border-t-4 border-purple-600 rounded-full"></div>
                        </div>
                        <div className="absolute inset-3 w-32 h-32 border-4 border-pink-200 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                          <div className="w-full h-full border-t-4 border-pink-600 rounded-full"></div>
                        </div>
                        <div className="absolute inset-8 w-20 h-20 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}>
                          <div className="w-full h-full border-t-4 border-purple-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Center Icon - Larger */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ArrowPathIcon className="h-16 w-16 text-purple-600 animate-pulse" />
                      </div>
                    </div>

                    <h3 className="text-4xl font-bold text-gray-900 mb-6">
                      {processingTitle}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {processingDescription}
                    </p>

                    {/* Progress Bar - Enhanced */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-300 relative"
                        style={{ width: `${processingProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-8">
                      {Math.round(processingProgress)}% {completed}
                    </p>

                    {/* Processing Steps - Enhanced */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircleIcon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-base text-gray-700 font-medium">
                          {stepAnalysis}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 ${processingProgress > 50 ? 'bg-green-500' : 'bg-purple-500 animate-pulse'} rounded-full flex items-center justify-center shadow-lg`}>
                          <ArrowPathIcon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-base text-gray-700 font-medium">
                          {stepRotating}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 ${processingProgress > 90 ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center shadow-lg`}>
                          <CheckCircleIcon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-base text-gray-700 font-medium">
                          {stepOptimizing}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RESULT */}
          {currentStep === 'result' && rotateResult && (
            <div ref={resultRef} className="py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-8 text-center border-b border-gray-200">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {successTitle}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {successSubtitle}
                  </h3>
                  <p className="text-gray-600">
                    {(() => {
                      const completionText = getText('imageRotate.result.completionMessage', getFallbackText(
                        `${rotateResult.rotationAngle}° döndürme işlemi kalite kaybı olmadan tamamlandı`, 
                        `${rotateResult.rotationAngle}° rotation completed without quality loss`, 
                        `Rotación de ${rotateResult.rotationAngle}° completada sin pérdida de calidad`
                      ));
                      
                      // Enhanced debug logging for completion message
                      console.log('🔄 IMAGE ROTATE DEBUG - Completion Message:', {
                        locale,
                        rotationAngle: rotateResult.rotationAngle,
                        completionText,
                        getFallbackResult: getFallbackText(
                          `${rotateResult.rotationAngle}° döndürme işlemi kalite kaybı olmadan tamamlandı`, 
                          `${rotateResult.rotationAngle}° rotation completed without quality loss`, 
                          `Rotación de ${rotateResult.rotationAngle}° completada sin pérdida de calidad`
                        )
                      });
                      
                      return completionText;
                    })()}
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Before */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {beforeTitle}
                      </h4>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Original"
                            className="w-full h-64 object-contain rounded-xl"
                          />
                        )}
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-gray-900">{file?.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(rotateResult.originalSize)}</p>
                        </div>
                      </div>
                    </div>

                    {/* After */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {afterTitle}
                      </h4>
                      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                        <img
                          src={rotateResult.downloadUrl}
                          alt="Rotated"
                          className="w-full h-64 object-contain rounded-xl"
                        />
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-green-900">
                            {rotatedImageTitle}
                          </p>
                          <p className="text-sm text-green-600">
                            {formatFileSize(rotateResult.rotatedSize)} • {rotateResult.rotationAngle}° {rotatedAngle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Section */}
                  <div className="mt-8 text-center">
                    <a
                      href={rotateResult.downloadUrl}
                      download={`rotated_${file?.name}`}
                      className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg space-x-3"
                    >
                      <CheckCircleIcon className="h-6 w-6" />
                      <span>{downloadButton}</span>
                    </a>
                    
                    <button
                      onClick={resetProcess}
                      className="ml-4 inline-flex items-center bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      {newImageButton}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <style jsx>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #9333ea, #ec4899);
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .slider-purple::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #9333ea, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
} 