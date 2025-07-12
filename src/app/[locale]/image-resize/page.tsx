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
  
  const sizeText = previewWidth === originalDimensions.width && previewHeight === originalDimensions.height 
    ? (locale === 'fr' ? 'Taille Originale' : 'Original Size')
    : previewWidth < originalDimensions.width || previewHeight < originalDimensions.height
    ? (locale === 'fr' ? 'Réduction' : 'Shrinking')
    : (locale === 'fr' ? 'Agrandissement' : 'Enlarging');
  
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
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
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

  // Processing status with Spanish support
  const getProcessingStatus = () => {
    const isTurkish = locale === 'tr';
    const isFrench = locale === 'fr';
    const isSpanish = locale === 'es';
    
    if (processingProgress < 15) {
      return isTurkish ? 'Resim analiz ediliyor...' : (isFrench ? 'Analyse de image...' : (isSpanish ? 'Analizando imagen...' : 'Analyzing image...'));
    } else if (processingProgress < 35) {
      return isTurkish ? 'Boyutlandırma hazırlanıyor...' : (isFrench ? 'Preparation du redimensionnement...' : (isSpanish ? 'Preparando redimensionado...' : 'Preparing resize...'));
    } else if (processingProgress < 60) {
      return isTurkish ? 'Boyutlar hesaplanıyor...' : (isFrench ? 'Calcul des dimensions...' : (isSpanish ? 'Calculando dimensiones...' : 'Calculating dimensions...'));
    } else if (processingProgress < 85) {
      return isTurkish ? 'Resim boyutlandırılıyor...' : (isFrench ? 'Redimensionnement de image...' : (isSpanish ? 'Redimensionando imagen...' : 'Resizing image...'));
    } else {
      return isTurkish ? 'Sonlandırılıyor...' : (isFrench ? 'Finalisation...' : (isSpanish ? 'Finalizando...' : 'Finalizing...'));
    }
  };

  // Language detection with Spanish support
  const isTurkish = locale === 'tr';
  const isFrench = locale === 'fr';
  const isSpanish = locale === 'es';
  
  // Header texts with Spanish support
  const statsText = isTurkish ? '5M+ Resim Boyutlandırıldı • AI Destekli' : (isFrench ? '5M+ Images Redimensionnees • IA' : (isSpanish ? '5M+ Imágenes Redimensionadas • Alimentado por IA' : '5M+ Images Resized • AI Powered'));
  const mainTitle = isTurkish ? '📐 Resim Boyutlandırma' : (isFrench ? '📐 Redimensionner Image' : (isSpanish ? '📐 Redimensionar Imagen' : '📐 Image Resize'));
  const description = isTurkish ? 'Resimlerinizi hassas ve kaliteli bir şekilde istediğiniz boyuta getirin' : (isFrench ? 'Redimensionnez vos images a toute dimension avec precision et qualite' : (isSpanish ? 'Redimensiona tus imágenes a cualquier tamaño con precisión y calidad' : 'Resize your images to any dimension with precision and quality'));
  const headerTitle = isTurkish ? 'Resim Boyutlandırma' : (isFrench ? 'Redimensionner Image' : (isSpanish ? 'Redimensionar Imagen' : 'Image Resize'));
  const stepText = isTurkish ? 'Adım' : (isFrench ? 'Etape' : (isSpanish ? 'Paso' : 'Step'));
  const ofText = isTurkish ? '/ 4' : (isFrench ? 'sur 4' : (isSpanish ? 'de 4' : 'of 4'));
  const stepNumber = currentStep === 'upload' ? '1' : currentStep === 'configure' ? '2' : currentStep === 'processing' ? '3' : '4';
  const newImageText = isTurkish ? 'Yeni Resim' : (isFrench ? 'Nouvelle Image' : (isSpanish ? 'Nueva Imagen' : 'New Image'));
  
  // Upload step with Spanish support
  const uploadTitle = isDragActive 
    ? (isTurkish ? 'Resminizi buraya bırakın' : (isFrench ? 'Deposez votre image ici' : (isSpanish ? 'Arrastra tu imagen aquí' : 'Drop your image here')))
    : (isTurkish ? 'Boyutlandırılacak Resim Seç' : (isFrench ? 'Selectionner Image a Redimensionner' : (isSpanish ? 'Seleccionar Imagen para Redimensionar' : 'Select Image to Resize')));
  const formatText = isTurkish ? 'PNG, JPEG, WebP, GIF • 50MB\'a kadar' : (isFrench ? 'PNG, JPEG, WebP, GIF • Jusqu a 50MB' : (isSpanish ? 'PNG, JPEG, WebP, GIF • Hasta 50MB' : 'PNG, JPEG, WebP, GIF • Up to 50MB'));
  const chooseFileText = isTurkish ? 'Dosya Seç' : (isFrench ? 'Choisir Fichier' : (isSpanish ? 'Elegir Archivo' : 'Choose File'));
  const secureText = isTurkish ? 'Güvenli İşlem' : (isFrench ? 'Traitement Securise' : (isSpanish ? 'Procesamiento Seguro' : 'Secure Processing'));
  const fastText = isTurkish ? 'Çok Hızlı' : (isFrench ? 'Tres Rapide' : (isSpanish ? 'Muy Rápido' : 'Lightning Fast'));
  const pixelText = isTurkish ? 'Piksel Mükemmel' : (isFrench ? 'Pixel Parfait' : (isSpanish ? 'Píxel Perfecto' : 'Pixel Perfect'));
  
  // Configure step with Spanish support
  const configureTitle = isTurkish ? 'Boyutlandırma Ayarlarını Yapılandır' : (isFrench ? 'Configurer Parametres Redimensionnement' : (isSpanish ? 'Configurar Ajustes de Redimensionado' : 'Configure Resize Settings'));
  const configureDesc = isTurkish ? 'İstediğiniz boyutları ve seçenekleri ayarlayın' : (isFrench ? 'Definissez vos dimensions et options souhaitees' : (isSpanish ? 'Configura las dimensiones y opciones deseadas' : 'Set your desired dimensions and options'));
  const previewTitle = isTurkish ? 'Canlı Önizleme' : (isFrench ? 'Apercu en Direct' : (isSpanish ? 'Vista Previa en Vivo' : 'Live Preview'));
  const previewInstructions = isTurkish ? '🎯 Sağdaki kontrollerle boyutları ayarlayın ve canlı önizlemeyi görün' : (isFrench ? '🎯 Ajustez les dimensions avec les controles de droite et voyez apercu en direct' : (isSpanish ? '🎯 Ajusta las dimensiones con los controles de la derecha y ve la vista previa en vivo' : '🎯 Adjust dimensions using controls on the right and see live preview'));
  const resizeModeText = isTurkish ? 'Boyutlandırma Modu' : (isFrench ? 'Mode de Redimensionnement' : (isSpanish ? 'Modo de Redimensionado' : 'Resize Mode'));
  const byPixelsText = isTurkish ? 'Piksel Bazında' : (isFrench ? 'Par Pixels' : (isSpanish ? 'Por Píxeles' : 'By Pixels'));
  const byPercentageText = isTurkish ? 'Yüzde Bazında' : (isFrench ? 'Par Pourcentage' : (isSpanish ? 'Por Porcentaje' : 'By Percentage'));
  const widthText = isTurkish ? 'Genişlik (px)' : (isFrench ? 'Largeur (px)' : (isSpanish ? 'Ancho (px)' : 'Width (px)'));
  const heightText = isTurkish ? 'Yükseklik (px)' : (isFrench ? 'Hauteur (px)' : (isSpanish ? 'Alto (px)' : 'Height (px)'));
  const widthPlaceholder = isTurkish ? 'Genişlik girin...' : (isFrench ? 'Entrez la largeur...' : (isSpanish ? 'Ingresa el ancho...' : 'Enter width...'));
  const heightPlaceholder = isTurkish ? 'Yükseklik girin...' : (isFrench ? 'Entrez la hauteur...' : (isSpanish ? 'Ingresa la altura...' : 'Enter height...'));
  const percentageText = isTurkish ? 'Orijinalin %\'sine boyutlandır' : (isFrench ? 'Redimensionner a % de original' : (isSpanish ? 'Redimensionar al % del original' : 'Resize to % of original'));
  const percentagePlaceholder = isTurkish ? 'Yüzde girin...' : (isFrench ? 'Entrez le pourcentage...' : (isSpanish ? 'Ingresa el porcentaje...' : 'Enter percentage...'));
  const resultText = isTurkish ? 'Sonuç:' : (isFrench ? 'Resultat:' : (isSpanish ? 'Resultado:' : 'Result:'));
  const aspectRatioText = isTurkish ? 'En-boy oranını koru' : (isFrench ? 'Maintenir le ratio aspect' : (isSpanish ? 'Mantener relación de aspecto' : 'Maintain aspect ratio'));
  const noEnlargeText = isTurkish ? 'Küçükse büyütme' : (isFrench ? 'Ne pas agrandir si plus petit' : (isSpanish ? 'No ampliar si es más pequeño' : 'Do not enlarge if smaller'));
  const startText = isTurkish ? '🚀 Boyutlandırmayı Başlat' : (isFrench ? '🚀 Commencer le Redimensionnement' : (isSpanish ? '🚀 Iniciar Redimensionado' : '🚀 Start Resizing'));
  
  // Processing step with Spanish support
  const processingTitle = isTurkish ? '🤖 AI Resminizi Boyutlandırıyor' : (isFrench ? '🤖 IA Redimensionne Votre Image' : (isSpanish ? '🤖 IA Redimensionando tu Imagen' : '🤖 AI Resizing Your Image'));
  const processingDesc = isTurkish ? 'Resminizi hassas bir şekilde işlerken lütfen bekleyin...' : (isFrench ? 'Veuillez patienter pendant que nous traitons votre image avec precision...' : (isSpanish ? 'Por favor espera mientras procesamos tu imagen con precisión...' : 'Please wait while we process your image with precision...'));
  const completeText = isTurkish ? 'Tamamlandı' : (isFrench ? 'Termine' : (isSpanish ? 'Completado' : 'Complete'));
  
  // Result step with Spanish support
  const resultTitle = isTurkish ? '✅ Boyutlandırma Tamamlandı!' : (isFrench ? '✅ Redimensionnement Termine !' : (isSpanish ? '✅ ¡Redimensionado Completado!' : '✅ Resize Complete!'));
  const resultDescText = isTurkish ? 'Resminiz başarıyla boyutlandırıldı' : (isFrench ? 'Votre image a ete redimensionnee avec succes' : (isSpanish ? 'Tu imagen ha sido redimensionada exitosamente' : 'Your image has been resized successfully'));
  const originalText = isTurkish ? 'Orijinal' : (isFrench ? 'Original' : (isSpanish ? 'Original' : 'Original'));
  const resizedText = isTurkish ? 'Boyutlandırılmış' : (isFrench ? 'Redimensionnee' : (isSpanish ? 'Redimensionada' : 'Resized'));
  const downloadText = isTurkish ? '📥 Boyutlandırılmış Resmi İndir' : (isFrench ? '📥 Telecharger Image Redimensionnee' : (isSpanish ? '📥 Descargar Imagen Redimensionada' : '📥 Download Resized Image'));
  const anotherText = isTurkish ? 'Başka Resim Boyutlandır' : (isFrench ? 'Redimensionner une Autre Image' : (isSpanish ? 'Redimensionar Otra Imagen' : 'Resize Another Image'));

  // Debug logging
  console.log('🐛 Current Step:', currentStep);
  console.log('🐛 Is Turkish:', isTurkish);
  console.log('🐛 Is French:', isFrench);
  console.log('🐛 Is Spanish:', isSpanish);
  console.log('🐛 Main Title:', mainTitle);
  console.log('🐛 Result Title:', resultTitle);
  console.log('🐛 Download Text:', downloadText);

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