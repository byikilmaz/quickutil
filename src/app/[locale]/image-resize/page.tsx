'use client';
import { useState, useRef, useEffect } from 'react';
import { PhotoIcon, SparklesIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
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
  resizeImage,
  getImageDimensions,
  formatFileSize,
  type ResizeOptions 
} from '@/lib/imageUtils';

// Types
interface ResizeResult {
  originalFile: File;
  resizedBlob: Blob;
  originalSize: number;
  resizedSize: number;
  originalDimensions: { width: number; height: number };
  resizedDimensions: { width: number; height: number };
  downloadUrl: string;
}

type ResizeMode = 'pixels' | 'percentage';

// Simple Preview Component
function SimplePreviewBox({ 
  imageUrl, 
  originalDimensions, 
  width, 
  height,
  locale
}: {
  imageUrl: string;
  originalDimensions: { width: number; height: number };
  width: number | undefined;
  height: number | undefined;
  locale: string;
}) {
  const previewWidth = width || originalDimensions.width;
  const previewHeight = height || originalDimensions.height;
  
  const t = getTranslations(locale);
  const getText = (key: string, fallback: string) => {
    // Try standard translations first
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      if (value) return value;
    } catch {
      // Fall through to manual translations
    }
    
    // Helper function for multi-language fallbacks including French  
    const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
      console.log(`🖼️ SIMPLE PREVIEW DEBUG - getFallbackText called for locale: ${locale}`);
      console.log(`  - TR: ${trText}`);
      console.log(`  - EN: ${enText}`);
      console.log(`  - ES: ${esText || 'not provided'}`);
      console.log(`  - FR: ${frText || 'not provided'}`);
      console.log(`  - DE: ${deText || 'not provided'}`);
      
      switch (locale) {
        case 'tr': return trText;
        case 'en': return enText;
        case 'es': return esText || enText;
        case 'fr': return frText || enText;
        case 'de': return deText || enText;
        default: return enText;
      }
    };
    
    // Manual translations with French support
    const translations: { [key: string]: () => string } = {
      'imageResize.preview.originalSize': () => getFallbackText('Orijinal Boyut', 'Original Size', 'Tamaño Original', 'Taille Originale', 'Taille Originale'),
      'imageResize.preview.shrinking': () => getFallbackText('Küçültülüyor', 'Shrinking', 'Reduciendo', 'Réduction', 'Réduction'),
      'imageResize.preview.enlarging': () => getFallbackText('Büyütülüyor', 'Enlarging', 'Ampliando', 'Agrandissement', 'Agrandissement')
    };
    
    if (translations[key]) {
      return translations[key]();
    }
    
    return fallback;
  };
  
  const sizeText = previewWidth === originalDimensions.width && previewHeight === originalDimensions.height 
    ? getText('imageResize.preview.originalSize', 'Original Size')
    : previewWidth < originalDimensions.width || previewHeight < originalDimensions.height
    ? getText('imageResize.preview.shrinking', 'Shrinking')
    : getText('imageResize.preview.enlarging', 'Enlarging');
  
  return (
    <div className="relative bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[400px] flex items-center justify-center">
      <div className="relative">
        <img
          src={imageUrl}
          alt="Live Preview"
          className="max-w-full max-h-[350px] object-contain rounded-lg shadow-lg"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '350px',
            maxHeight: '350px'
          }}
        />
        
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded text-sm font-medium">
          {previewWidth} × {previewHeight}
        </div>
        
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
            {sizeText}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ImageResize({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ImageResizeContent locale={locale} />;
}

function ImageResizeContent({ locale }: { locale: string }) {
  console.log('🌐 ImageResize - Locale:', locale);
  
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const t = getTranslations(locale);

  // Enhanced browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`));
      
      console.log('📐 IMAGE RESIZE DEBUG - Enhanced Browser Language Auto-Detection:', {
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
        
        console.log('📐 IMAGE RESIZE DEBUG - Language Detection Process:', {
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
          console.log('📐 IMAGE RESIZE DEBUG - Using stored preference:', targetLanguage);
        } 
        // Priority 2: Browser language
        else if (supportedLanguages.includes(browserLanguage)) {
          targetLanguage = browserLanguage;
          localStorage.setItem('quickutil_preferred_locale', targetLanguage);
          console.log('📐 IMAGE RESIZE DEBUG - Using browser language:', targetLanguage);
        }
        // Priority 3: Check Accept-Language header languages
        else {
          const acceptLanguages = navigator.languages || [];
          for (const lang of acceptLanguages) {
            const shortLang = lang.slice(0, 2).toLowerCase();
            if (supportedLanguages.includes(shortLang)) {
              targetLanguage = shortLang;
              localStorage.setItem('quickutil_preferred_locale', targetLanguage);
              console.log('📐 IMAGE RESIZE DEBUG - Using Accept-Language:', targetLanguage);
              break;
            }
          }
        }
        
        // Redirect to appropriate language
        const newPath = `/${targetLanguage}${currentPath}`;
        console.log('📐 IMAGE RESIZE DEBUG - Redirecting:', {
          from: currentPath,
          to: newPath,
          targetLanguage,
          reason: preferredLanguage ? 'stored-preference' : 'browser-detection'
        });
        window.location.href = newPath;
      } else {
        // Log current locale validation
        console.log('📐 IMAGE RESIZE DEBUG - Locale already in path:', {
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
  
  // Helper function for multi-language fallbacks including Spanish and German
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    console.log(`📐 IMAGE RESIZE DEBUG - getFallbackText called for locale: ${locale}`);
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
        console.log(`🇩🇪 GERMAN DETECTED - Using: ${result}`);
        break;
      default: 
        result = enText;
    }
    
    console.log(`  - FINAL RESULT: ${result}`);
    return result;
  };
  
  const getText = (key: string, fallback: string) => {
    // Try standard translations first
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      if (value) return value;
    } catch {
      // Fall through to manual translations
    }
    
    // Manual translations with Spanish support
    const translations: { [key: string]: () => string } = {
      // Header and navigation
      'imageResize.badge': () => getFallbackText('5M+ Resim Boyutlandırıldı • AI Destekli', '5M+ Images Resized • AI-Powered', '5M+ Imágenes Redimensionadas • Con IA', '5M+ Images Redimensionnées • Alimenté par IA', '5M+ Bilder vergrößert • KI-gestützt'),
      'imageResize.title': () => getFallbackText('📐 Resim Boyutlandırma', '📐 Image Resize', '📐 Redimensionar Imagen', '📐 Redimensionner Image', '📐 Bildgrößenänderung'),
      'imageResize.description': () => getFallbackText('Resimlerinizi hassas ve kaliteli bir şekilde istediğiniz boyuta getirin', 'Resize your images precisely and with high quality', 'Redimensiona tus imágenes con precisión y alta calidad', 'Redimensionnez vos images avec précision et haute qualité', 'Ändern Sie die Größe Ihrer Bilder präzise und mit hoher Qualität'),
      'imageResize.headerTitle': () => getFallbackText('Resim Boyutlandırma', 'Image Resize', 'Redimensionar Imagen', 'Redimensionner Image', 'Bildgrößenänderung'),
      'imageResize.step': () => getFallbackText('Adım', 'Step', 'Paso', 'Étape', 'Schritt'),
      'imageResize.stepOf': () => getFallbackText('/ 4', '/ 4', '/ 4', '/ 4'),
      'imageResize.newImage': () => getFallbackText('Yeni Resim', 'New Image', 'Nueva Imagen', 'Nouvelle Image'),
      
      // Upload step
      'imageResize.upload.dropImage': () => getFallbackText('Resminizi buraya bırakın', 'Drop your image here', 'Suelta tu imagen aquí', 'Déposez votre image ici', 'Lassen Sie Ihr Bild hier fallen'),
      'imageResize.upload.selectImage': () => getFallbackText('Boyutlandırılacak Resim Seç', 'Select Image to Resize', 'Seleccionar Imagen para Redimensionar', 'Sélectionner Image à Redimensionner', 'Bild zum Vergrößern auswählen'),
      'imageResize.upload.supportedFormats': () => getFallbackText('PNG, JPEG, WebP, GIF • 50MB\'a kadar', 'PNG, JPEG, WebP, GIF • Up to 50MB', 'PNG, JPEG, WebP, GIF • Hasta 50MB', 'PNG, JPEG, WebP, GIF • Jusqu\'à 50MB', 'PNG, JPEG, WebP, GIF • Bis zu 50MB'),
      'imageResize.upload.chooseFile': () => getFallbackText('Dosya Seç', 'Choose File', 'Elegir Archivo', 'Choisir Fichier', 'Datei auswählen'),
      'imageResize.upload.secure': () => getFallbackText('Güvenli İşlem', 'Secure Processing', 'Procesamiento Seguro', 'Traitement Sécurisé', 'Sichere Verarbeitung'),
      'imageResize.upload.fast': () => getFallbackText('Çok Hızlı', 'Very Fast', 'Muy Rápido', 'Très Rapide', 'Sehr schnell'),
      'imageResize.upload.pixelPerfect': () => getFallbackText('Piksel Mükemmel', 'Pixel Perfect', 'Píxel Perfecto', 'Pixel Parfait', 'Pixelgenau'),
      
      // Configure step
      'imageResize.configure.title': () => getFallbackText('Boyutlandırma Ayarlarını Yapılandır', 'Configure Resize Settings', 'Configurar Ajustes de Redimensionamiento', 'Configurer les paramètres de redimensionnement', 'Größenänderungseinstellungen konfigurieren'),
      'imageResize.configure.description': () => getFallbackText('İstediğiniz boyutları ve seçenekleri ayarlayın', 'Set your desired dimensions and options', 'Establece las dimensiones y opciones deseadas', 'Définissez les dimensions et les options de votre choix', 'Stellen Sie Ihre gewünschten Abmessungen und Optionen ein'),
      'imageResize.configure.previewTitle': () => getFallbackText('Canlı Önizleme', 'Live Preview', 'Vista Previa en Vivo', 'Aperçu en direct', 'Live-Vorschau'),
      'imageResize.configure.previewInstructions': () => getFallbackText('🎯 Sağdaki kontrollerle boyutları ayarlayın ve canlı önizlemeyi görün', '🎯 Adjust dimensions with controls on the right and see live preview', '🎯 Ajusta las dimensiones con los controles de la derecha y ve la vista previa en vivo', '🎯 Ajustez les dimensions avec les contrôles de droite et voyez l\'aperçu en direct', '🎯 Passen Sie die Abmessungen mit den Steuerelementen rechts an und sehen Sie die Live-Vorschau'),
      'imageResize.configure.resizeMode': () => getFallbackText('Boyutlandırma Modu', 'Resize Mode', 'Modo de Redimensionamiento', 'Mode de redimensionnement'),
      'imageResize.configure.byPixels': () => getFallbackText('Piksel Bazında', 'By Pixels', 'Por Píxeles', 'Par pixels'),
      'imageResize.configure.byPercentage': () => getFallbackText('Yüzde Bazında', 'By Percentage', 'Por Porcentaje', 'Par pourcentage'),
      'imageResize.configure.width': () => getFallbackText('Genişlik (px)', 'Width (px)', 'Ancho (px)', 'Largeur (px)'),
      'imageResize.configure.height': () => getFallbackText('Yükseklik (px)', 'Height (px)', 'Alto (px)', 'Hauteur (px)'),
      'imageResize.configure.widthPlaceholder': () => getFallbackText('Genişlik girin...', 'Enter width...', 'Ingresa el ancho...', 'Entrez la largeur...'),
      'imageResize.configure.heightPlaceholder': () => getFallbackText('Yükseklik girin...', 'Enter height...', 'Ingresa el alto...', 'Entrez la hauteur...'),
      'imageResize.configure.percentage': () => getFallbackText('Orijinalin %\'sine boyutlandır', 'Resize to % of original', 'Redimensionar al % del original', 'Redimensionner à % du original'),
      'imageResize.configure.percentagePlaceholder': () => getFallbackText('Yüzde girin...', 'Enter percentage...', 'Ingresa el porcentaje...', 'Entrez le pourcentage...'),
      'imageResize.configure.result': () => getFallbackText('Sonuç:', 'Result:', 'Resultado:', 'Résultat:'),
      'imageResize.configure.aspectRatio': () => getFallbackText('En-boy oranını koru', 'Maintain aspect ratio', 'Mantener relación de aspecto', 'Maintenir le ratio d\'aspect'),
      'imageResize.configure.noEnlarge': () => getFallbackText('Küçükse büyütme', 'Don\'t enlarge if smaller', 'No ampliar si es más pequeña', 'Ne pas agrandir si el plus petit'),
      'imageResize.configure.startResize': () => getFallbackText('🚀 Boyutlandırmayı Başlat', '🚀 Start Resize', '🚀 Iniciar Redimensionamiento', '🚀 Démarrer le redimensionnement'),
      
      // Processing step
      'imageResize.processing.title': () => getFallbackText('🤖 AI Resminizi Boyutlandırıyor', '🤖 AI is Resizing Your Image', '🤖 IA Redimensionando tu Imagen', '🤖 IA vous redimensionne votre image', '🤖 KI ändert die Größe Ihres Bildes'),
      'imageResize.processing.description': () => getFallbackText('Resminizi hassas bir şekilde işlerken lütfen bekleyin...', 'Please wait while we precisely process your image...', 'Por favor espera mientras procesamos tu imagen con precisión...', 'Veuillez patienter pendant le traitement précis de votre image...', 'Bitte warten Sie, während wir Ihr Bild präzise verarbeiten...'),
      'imageResize.processing.complete': () => getFallbackText('Tamamlandı', 'Complete', 'Completado', 'Terminé', 'Abgeschlossen'),
      'imageResize.processing.step1': () => getFallbackText('Resim analiz ediliyor...', 'Analyzing image...', 'Analizando imagen...', 'Analyse de l\'image...', 'Bild wird analysiert...'),
      'imageResize.processing.step2': () => getFallbackText('Boyutlandırma hazırlanıyor...', 'Preparing resize...', 'Preparando redimensionamiento...', 'Préparation du redimensionnement...', 'Größenänderung wird vorbereitet...'),
      'imageResize.processing.step3': () => getFallbackText('Boyutlar hesaplanıyor...', 'Calculating dimensions...', 'Calculando dimensiones...', 'Calcul des dimensions...', 'Abmessungen werden berechnet...'),
      'imageResize.processing.step4': () => getFallbackText('Resim boyutlandırılıyor...', 'Resizing image...', 'Redimensionando imagen...', 'Redimensionnement de l\'image...', 'Bildgröße wird geändert...'),
      'imageResize.processing.step5': () => getFallbackText('Sonlandırılıyor...', 'Finalizing...', 'Finalizando...', 'Finalisation...', 'Wird abgeschlossen...'),
      
      // Result step
      'imageResize.result.title': () => getFallbackText('✅ Boyutlandırma Tamamlandı!', '✅ Resize Complete!', '✅ ¡Redimensionamiento Completado!', '✅ Redimensionnement terminé!', '✅ Größenänderung abgeschlossen!'),
      'imageResize.result.description': () => getFallbackText('Resminiz başarıyla boyutlandırıldı', 'Your image has been successfully resized', 'Tu imagen ha sido redimensionada exitosamente', 'Votre image a été redimensionnée avec succès', 'Ihre Bildgröße wurde erfolgreich geändert'),
      'imageResize.result.original': () => getFallbackText('Orijinal', 'Original', 'Original', 'Original', 'Original'),
      'imageResize.result.resized': () => getFallbackText('Boyutlandırılmış', 'Resized', 'Redimensionada', 'Redimensionnée', 'Größe geändert'),
      'imageResize.result.download': () => getFallbackText('📥 Boyutlandırılmış Resmi İndir', '📥 Download Resized Image', '📥 Descargar Imagen Redimensionada', '📥 Télécharger l\'image redimensionnée', '📥 Bild mit geänderter Größe herunterladen'),
      'imageResize.result.another': () => getFallbackText('Başka Resim Boyutlandır', 'Resize Another Image', 'Redimensionar Otra Imagen', 'Redimensionner une autre image', 'Weiteres Bild vergrößern'),
      
      // Preview texts
      'imageResize.preview.originalSize': () => getFallbackText('Orijinal Boyut', 'Original Size', 'Tamaño Original', 'Taille Originale', 'Taille Originale'),
      'imageResize.preview.shrinking': () => getFallbackText('Küçültülüyor', 'Shrinking', 'Reduciendo', 'Réduction', 'Réduction'),
      'imageResize.preview.enlarging': () => getFallbackText('Büyütülüyor', 'Enlarging', 'Ampliando', 'Agrandissement', 'Agrandissement')
    };
    
    // Check translations first, then return fallback
    if (translations[key]) {
      return translations[key]();
    }
    
    return fallback;
  };

  // Refs for smooth scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // State
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('pixels');
  const [percentageValue, setPercentageValue] = useState<number>(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [doNotEnlarge, setDoNotEnlarge] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resizeResult, setResizeResult] = useState<ResizeResult | null>(null);

  // Auto-focus on upload area
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => handleFileSelect(acceptedFiles),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.heic', '.heif']
    },
    multiple: false
  });

  // File selection
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    
    setFile(selectedFile);
    
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      setWidth(dimensions.width);
      setHeight(dimensions.height);
      setCurrentStep('configure');
      
      setTimeout(() => {
        configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }
  };

  // Width change
  const handleWidthChange = (value: string) => {
    const newWidth = value ? parseInt(value) : undefined;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  // Height change
  const handleHeightChange = (value: string) => {
    const newHeight = value ? parseInt(value) : undefined;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  // Start resize
  const startResize = async () => {
    if (!file || !originalDimensions) return;

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    setTimeout(() => {
      processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);

    try {
      let finalWidth: number;
      let finalHeight: number;

      if (resizeMode === 'percentage') {
        finalWidth = Math.round(originalDimensions.width * (percentageValue / 100));
        finalHeight = Math.round(originalDimensions.height * (percentageValue / 100));
      } else {
        finalWidth = width || originalDimensions.width;
        finalHeight = height || originalDimensions.height;
      }

      if (doNotEnlarge && (finalWidth > originalDimensions.width || finalHeight > originalDimensions.height)) {
        throw new Error('Cannot enlarge image');
      }

      const progressSteps = [
        { progress: 15, delay: 800 },
        { progress: 35, delay: 1000 },
        { progress: 60, delay: 1200 },
        { progress: 85, delay: 1000 },
        { progress: 100, delay: 800 }
      ];

      for (const step of progressSteps) {
        setProcessingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      const options: ResizeOptions = {
        width: finalWidth,
        height: finalHeight,
        maintainAspectRatio: false
      };

      const result = await resizeImage(file, options);
      
      const resizeData: ResizeResult = {
        originalFile: file,
        resizedBlob: result.file,
        originalSize: file.size,
        resizedSize: result.file.size,
        originalDimensions,
        resizedDimensions: { width: finalWidth, height: finalHeight },
        downloadUrl: URL.createObjectURL(result.file)
      };

      setResizeResult(resizeData);
      setCurrentStep('result');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

      if (user) {
        await ActivityTracker.createActivity(user.uid, {
          type: 'image_resize',
          fileName: result.file.name,
          originalFileName: file.name,
          fileSize: file.size,
          processedSize: result.file.size,
          status: 'success',
          category: 'Image',
          processingTime: Date.now()
        });
      }

    } catch (error) {
      console.error('Resize error:', error);
      setCurrentStep('configure');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset
  const resetToStart = () => {
    setCurrentStep('upload');
    setFile(null);
    setResizeResult(null);
    setOriginalDimensions(null);
    setWidth(undefined);
    setHeight(undefined);
    setPercentageValue(100);
    setResizeMode('pixels');
    setMaintainAspectRatio(true);
    setDoNotEnlarge(false);
    
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Download
  const downloadResizedImage = () => {
    if (resizeResult) {
      const link = document.createElement('a');
      link.href = resizeResult.downloadUrl;
      link.download = `resized_${resizeResult.originalFile.name}`;
      link.click();
    }
  };

  // Processing status - converted to getText system
  const getProcessingStatus = () => {
    if (processingProgress < 15) {
      return getText('imageResize.processing.step1', 'Resim analiz ediliyor...');
    } else if (processingProgress < 35) {
      return getText('imageResize.processing.step2', 'Boyutlandırma hazırlanıyor...');
    } else if (processingProgress < 60) {
      return getText('imageResize.processing.step3', 'Boyutlar hesaplanıyor...');
    } else if (processingProgress < 85) {
      return getText('imageResize.processing.step4', 'Resim boyutlandırılıyor...');
    } else {
      return getText('imageResize.processing.step5', 'Sonlandırılıyor...');
    }
  };

  // Locale variables no longer needed - using getText system
  
  // Header texts - converted to getText system
  const statsText = getText('imageResize.badge', '5M+ Resim Boyutlandırıldı • AI Destekli');
  const mainTitle = getText('imageResize.title', '📐 Resim Boyutlandırma');
  const description = getText('imageResize.description', 'Resimlerinizi hassas ve kaliteli bir şekilde istediğiniz boyuta getirin');
  const headerTitle = getText('imageResize.headerTitle', 'Resim Boyutlandırma');
  const stepText = getText('imageResize.step', 'Adım');
  const ofText = getText('imageResize.stepOf', '/ 4');
  const stepNumber = currentStep === 'upload' ? '1' : currentStep === 'configure' ? '2' : currentStep === 'processing' ? '3' : '4';
  const newImageText = getText('imageResize.newImage', 'Yeni Resim');
  
  // Upload step - converted to getText system
  const uploadTitle = isDragActive 
    ? getText('imageResize.upload.dropImage', 'Resminizi buraya bırakın')
    : getText('imageResize.upload.selectImage', 'Boyutlandırılacak Resim Seç');
  const formatText = getText('imageResize.upload.supportedFormats', 'PNG, JPEG, WebP, GIF • 50MB\'a kadar');
  const chooseFileText = getText('imageResize.upload.chooseFile', 'Dosya Seç');
  const secureText = getText('imageResize.upload.secure', 'Güvenli İşlem');
  const fastText = getText('imageResize.upload.fast', 'Çok Hızlı');
  const pixelText = getText('imageResize.upload.pixelPerfect', 'Piksel Mükemmel');
  
  // Configure step - converted to getText system
  const configureTitle = getText('imageResize.configure.title', 'Boyutlandırma Ayarlarını Yapılandır');
  const configureDesc = getText('imageResize.configure.description', 'İstediğiniz boyutları ve seçenekleri ayarlayın');
  const previewTitle = getText('imageResize.configure.previewTitle', 'Canlı Önizleme');
  const previewInstructions = getText('imageResize.configure.previewInstructions', '🎯 Sağdaki kontrollerle boyutları ayarlayın ve canlı önizlemeyi görün');
  const resizeModeText = getText('imageResize.configure.resizeMode', 'Boyutlandırma Modu');
  const byPixelsText = getText('imageResize.configure.byPixels', 'Piksel Bazında');
  const byPercentageText = getText('imageResize.configure.byPercentage', 'Yüzde Bazında');
  const widthText = getText('imageResize.configure.width', 'Genişlik (px)');
  const heightText = getText('imageResize.configure.height', 'Yükseklik (px)');
  const widthPlaceholder = getText('imageResize.configure.widthPlaceholder', 'Genişlik girin...');
  const heightPlaceholder = getText('imageResize.configure.heightPlaceholder', 'Yükseklik girin...');
  const percentageText = getText('imageResize.configure.percentage', 'Orijinalin %\'sine boyutlandır');
  const percentagePlaceholder = getText('imageResize.configure.percentagePlaceholder', 'Yüzde girin...');
  const resultText = getText('imageResize.configure.result', 'Sonuç:');
  const aspectRatioText = getText('imageResize.configure.aspectRatio', 'En-boy oranını koru');
  const noEnlargeText = getText('imageResize.configure.noEnlarge', 'Küçükse büyütme');
  const startText = getText('imageResize.configure.startResize', '🚀 Boyutlandırmayı Başlat');
  
  // Processing step - converted to getText system
  const processingTitle = getText('imageResize.processing.title', '🤖 AI Resminizi Boyutlandırıyor');
  const processingDesc = getText('imageResize.processing.description', 'Resminizi hassas bir şekilde işlerken lütfen bekleyin...');
  const completeText = getText('imageResize.processing.complete', 'Tamamlandı');
  
  // Result step - converted to getText system
  const resultTitle = getText('imageResize.result.title', '✅ Boyutlandırma Tamamlandı!');
  const resultDescText = getText('imageResize.result.description', 'Resminiz başarıyla boyutlandırıldı');
  const originalText = getText('imageResize.result.original', 'Orijinal');
  const resizedText = getText('imageResize.result.resized', 'Boyutlandırılmış');
  const downloadText = getText('imageResize.result.download', '📥 Boyutlandırılmış Resmi İndir');
  const anotherText = getText('imageResize.result.another', 'Başka Resim Boyutlandır');

  // Enhanced Debug logging for translations and locale detection with French support
  useEffect(() => {
    console.log('📐 IMAGE RESIZE DEBUG - Enhanced Translation System:');
    console.log('  - Current locale:', locale);
    console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
    console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
    console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
    console.log('  - Is French detected:', typeof navigator !== 'undefined' ? navigator.language.startsWith('fr') : false);
    
    console.log('📐 IMAGE RESIZE DEBUG - Sample Translation Values:');
    console.log('  - Title:', getText('imageResize.title', '📐 Image Resize'));
    console.log('  - Upload Title:', getText('imageResize.upload.selectImage', 'Select Image to Resize'));
    console.log('  - Configure Title:', getText('imageResize.configure.title', 'Configure Resize Settings'));
    console.log('  - Processing Title:', getText('imageResize.processing.title', '🤖 AI is Resizing Your Image'));
    console.log('  - Result Title:', getText('imageResize.result.title', '✅ Resize Complete!'));
    console.log('  - Download Text:', getText('imageResize.result.download', '📥 Download Resized Image'));
  }, [locale]);

  // Browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de']; // Updated to match SupportedLocale
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`) || currentPath === `/${lang}`);
      
      if (!hasLocaleInPath && currentPath === '/') {
        const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
        const preferredLanguage = localStorage.getItem('quickutil_preferred_locale');
        
        console.log('🌍 IMAGE RESIZE DEBUG - Browser Language Auto-Detection:', {
          currentPath,
          browserLanguage,
          preferredLanguage,
          supportedLanguages,
          willRedirect: supportedLanguages.includes(preferredLanguage || browserLanguage)
        });
        
        if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
          console.log('🌍 Redirecting to preferred language:', preferredLanguage);
          window.location.href = `/${preferredLanguage}/image-resize`;
          return;
        }
        
        if (supportedLanguages.includes(browserLanguage)) {
          console.log('🌍 Redirecting to browser language:', browserLanguage);
          localStorage.setItem('quickutil_preferred_locale', browserLanguage);
          window.location.href = `/${browserLanguage}/image-resize`;
          return;
        }
        
        // Default to English if no match
        console.log('🌍 Defaulting to English');
        localStorage.setItem('quickutil_preferred_locale', 'en');
        window.location.href = '/en/image-resize';
      }
    };

    detectAndRedirectLanguage();
  }, []);

  console.log('🔤 IMAGE RESIZE DEBUG - Locale Detection:');
  console.log('  - Current locale:', locale);
  console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
  console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
  console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
  
  console.log('🔤 IMAGE RESIZE DEBUG - Translation Values:');
  console.log('  - Step Text:', stepText);
  console.log('  - Main Title:', mainTitle);
  console.log('  - Upload Title:', uploadTitle);
  console.log('  - Configure Title:', configureTitle);
  console.log('  - Processing Title:', processingTitle);
  console.log('  - Result Title:', resultTitle);
  console.log('  - Download Text:', downloadText);
  console.log('  - Choose File Text:', chooseFileText);
  console.log('  - Pixel Perfect Text:', pixelText);
  
  console.log('🔤 IMAGE RESIZE DEBUG - Step Status:');
  console.log('  - Current Step:', currentStep);
  console.log('  - Step Number:', stepNumber);
  console.log('  - Processing Progress:', processingProgress);
  
  console.log('🔤 IMAGE RESIZE DEBUG - Translations Test:');
  const testKeys = [
    'imageResize.upload.chooseFile',
    'imageResize.upload.pixelPerfect', 
    'imageResize.preview.originalSize'
  ];
  testKeys.forEach(key => {
    console.log(`  - ${key}:`, getText(key, 'NOT_FOUND'));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
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
      
      <StructuredData type="website" />

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {headerTitle}
                </h1>
                <p className="text-sm text-gray-600">{stepText} {stepNumber} {ofText}</p>
              </div>
            </div>
            
            {currentStep !== 'upload' && (
              <button
                onClick={resetToStart}
                className="flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/70 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>{newImageText}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* STEP 1: UPLOAD */}
        <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
          currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 text-purple-600 animate-pulse mr-2" />
              {statsText}
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                {mainTitle}
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 border-2 border-purple-200/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-4 border-2 border-pink-200/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              <div
                {...getRootProps()}
                className={`relative z-10 bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-white/90 transition-all duration-300 cursor-pointer ${
                  isDragActive ? 'border-purple-500 bg-purple-50' : ''
                }`}
              >
                <input {...getInputProps()} />
                <div className="relative">
                  <CloudArrowUpIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg opacity-20 animate-pulse"></div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {uploadTitle}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {formatText}
                </p>
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 inline-block">
                  {chooseFileText}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-700">{secureText}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-700">{fastText}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm font-medium text-gray-700">{pixelText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: CONFIGURE */}
        {file && originalDimensions && (
          <div ref={configureRef} className={`py-16 transition-all duration-500 ${
            currentStep === 'configure' ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {configureTitle}
                  </h2>
                  <p className="text-gray-600">{configureDesc}</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left: Preview */}
                  <div className="lg:col-span-3">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">{previewTitle}</h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        {previewInstructions}
                      </p>
                      <SimplePreviewBox
                        imageUrl={URL.createObjectURL(file)}
                        originalDimensions={originalDimensions}
                        width={width}
                        height={height}
                        locale={locale}
                      />
                      <div className="mt-4 text-sm text-gray-700 text-center bg-white rounded-lg p-3">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-gray-600">{formatFileSize(file.size)} • Original: {originalDimensions.width}×{originalDimensions.height}</p>
                        <p className="text-purple-600 font-medium">Current: {width || originalDimensions.width}×{height || originalDimensions.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Settings */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      
                      {/* Mode Toggle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {resizeModeText}
                        </label>
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setResizeMode('pixels')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'pixels'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {byPixelsText}
                          </button>
                          <button
                            onClick={() => setResizeMode('percentage')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'percentage'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {byPercentageText}
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      {resizeMode === 'pixels' ? (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {widthText}
                            </label>
                            <input
                              type="number"
                              value={width || ''}
                              onChange={(e) => handleWidthChange(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                              placeholder={widthPlaceholder}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {heightText}
                            </label>
                            <input
                              type="number"
                              value={height || ''}
                              onChange={(e) => handleHeightChange(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                              placeholder={heightPlaceholder}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {percentageText}
                          </label>
                          <input
                            type="number"
                            value={percentageValue || ''}
                            onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 100)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            min="1"
                            max="500"
                            placeholder={percentagePlaceholder}
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="text-purple-600 font-medium">
                              {resultText} {Math.round(originalDimensions.width * (percentageValue / 100))}×{Math.round(originalDimensions.height * (percentageValue / 100))}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={maintainAspectRatio}
                            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {aspectRatioText}
                          </span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={doNotEnlarge}
                            onChange={(e) => setDoNotEnlarge(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {noEnlargeText}
                          </span>
                        </label>
                      </div>

                      {/* Start Button */}
                      <button
                        ref={processButtonRef}
                        onClick={startResize}
                        disabled={resizeMode === 'pixels' && !width && !height}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                      >
                        <PhotoIcon className="h-6 w-6" />
                        <span>{startText}</span>
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
                
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-purple-50/80 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-12">
                    <div className="w-40 h-40 mx-auto relative">
                      <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                      <div className="absolute inset-2 border-4 border-pink-300 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-4 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                      <div className="absolute inset-6 border-4 border-pink-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="h-16 w-16 text-purple-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    {processingTitle}
                  </h3>
                  
                  <p className="text-xl text-gray-700 mb-8 font-medium">
                    {processingDesc}
                  </p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                    <div 
                      className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative shadow-lg"
                      style={{ width: `${processingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-purple-600 font-semibold">{processingProgress}% {completeText}</p>
                  
                  <div className="mt-8 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-purple-700 font-medium">{getProcessingStatus()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT */}
        {currentStep === 'result' && resizeResult && (
          <div ref={resultRef} className="py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      {resultTitle}
                    </h2>
                    <p className="text-gray-600">{resultDescText}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Before */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-4">{originalText}</h3>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <img
                          src={URL.createObjectURL(resizeResult.originalFile)}
                          alt="Original"
                          className="max-w-full max-h-48 object-contain mx-auto rounded-lg"
                        />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{formatFileSize(resizeResult.originalSize)}</p>
                        <p>{resizeResult.originalDimensions.width}×{resizeResult.originalDimensions.height}</p>
                      </div>
                    </div>

                    {/* After */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-4">{resizedText}</h3>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border-2 border-purple-200">
                        <img
                          src={resizeResult.downloadUrl}
                          alt="Resized"
                          className="max-w-full max-h-48 object-contain mx-auto rounded-lg"
                        />
                      </div>
                      <div className="space-y-1 text-sm text-green-600 font-medium">
                        <p>{formatFileSize(resizeResult.resizedSize)}</p>
                        <p>{resizeResult.resizedDimensions.width}×{resizeResult.resizedDimensions.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="text-center space-y-4">
                    <button
                      onClick={downloadResizedImage}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
                    >
                      <CheckCircleIcon className="h-6 w-6" />
                      <span>{downloadText}</span>
                    </button>
                    
                    <button
                      onClick={resetToStart}
                      className="text-gray-600 hover:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {anotherText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
} 