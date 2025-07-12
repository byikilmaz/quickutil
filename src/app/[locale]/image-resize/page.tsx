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
  type ConversionResult,
  type ResizeOptions 
} from '@/lib/imageUtils';

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

// Simple Preview Component - No Interactive Resize
function SimplePreviewBox({ 
  imageUrl, 
  originalDimensions, 
  width, 
  height,
  getText
}: {
  imageUrl: string;
  originalDimensions: { width: number; height: number };
  width: number | undefined;
  height: number | undefined;
  getText: (key: string, fallback: string) => string;
}) {
  // Calculate preview dimensions
  const previewWidth = width || originalDimensions.width;
  const previewHeight = height || originalDimensions.height;
  
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
        
        {/* Dimension indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded text-sm font-medium">
          {previewWidth} × {previewHeight}
        </div>
        
        {/* Size comparison indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
            {previewWidth === originalDimensions.width && previewHeight === originalDimensions.height 
              ? getText('imageResize.preview.originalSize', 'Orijinal Boyut')
              : previewWidth < originalDimensions.width || previewHeight < originalDimensions.height
              ? getText('imageResize.preview.shrinking', 'Küçültülüyor')
              : getText('imageResize.preview.enlarging', 'Büyütülüyor')
            }
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
  // 🐛 DEBUG: Log the locale received
  console.log('🌐 ImageResize component - Received locale:', locale);
  
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
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

  // Component state - Step-based like PDF convert
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

  // Auto-focus on upload area when page loads
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  // Dropzone for file handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => handleFileSelect(acceptedFiles),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.heic', '.heif']
    },
    multiple: false
  });

  // Handle file selection
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
      
      // Scroll to configure section
      setTimeout(() => {
        configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }
  };

  // Handle width change with aspect ratio
  const handleWidthChange = (value: string) => {
    const newWidth = value ? parseInt(value) : undefined;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (value: string) => {
    const newHeight = value ? parseInt(value) : undefined;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  // Handle interactive resize
  const handleInteractiveDimensionsChange = (newWidth: number, newHeight: number) => {
    setWidth(newWidth);
    setHeight(newHeight);
  };

  // Start resize process
  const startResize = async () => {
    if (!file || !originalDimensions) return;

    // Note: Image resize is a free feature, no authentication required

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    // Scroll to processing section
    setTimeout(() => {
      processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      processingRef.current?.focus();
    }, 300);

    try {
      // Calculate final dimensions
      let finalWidth: number;
      let finalHeight: number;

      if (resizeMode === 'percentage') {
        finalWidth = Math.round(originalDimensions.width * (percentageValue / 100));
        finalHeight = Math.round(originalDimensions.height * (percentageValue / 100));
      } else {
        finalWidth = width || originalDimensions.width;
        finalHeight = height || originalDimensions.height;
      }

      // Check enlarge restriction
      if (doNotEnlarge && (finalWidth > originalDimensions.width || finalHeight > originalDimensions.height)) {
        throw new Error('Resim büyütme devre dışı. Mevcut boyuttan küçük bir boyut seçin.');
      }

      // Simulate progress steps with longer delays for better visibility
      const progressSteps = [
        { progress: 15, message: 'Analyzing image...', delay: 800 },
        { progress: 35, message: 'Preparing resize...', delay: 1000 },
        { progress: 60, message: 'Calculating dimensions...', delay: 1200 },
        { progress: 85, message: 'Resizing image...', delay: 1000 },
        { progress: 100, message: 'Finalizing...', delay: 800 }
      ];

      for (const step of progressSteps) {
        setProcessingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // Perform actual resize
      const options: ResizeOptions = {
        width: finalWidth,
        height: finalHeight,
        maintainAspectRatio: false
      };

      const result = await resizeImage(file, options);
      
      // Create resize result
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

      // Scroll to result section
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

      // Track activity
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

  // Reset to start
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

  // Download resized image
  const downloadResizedImage = () => {
    if (resizeResult) {
      const link = document.createElement('a');
      link.href = resizeResult.downloadUrl;
      link.download = `resized_${resizeResult.originalFile.name}`;
      link.click();
    }
  };

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

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-white" />
              </div>
              <div>
{(() => {
                  const headerTitle = locale === 'en' ? 'Image Resize' : locale === 'es' ? 'Redimensionar Imagen' : locale === 'fr' ? 'Redimensionner Image' : 'Image Resize';
                  console.log('🐛 DEBUG - Header Title:', headerTitle, '(locale:', locale + ')');
                  return (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {headerTitle}
                    </h1>
                  );
                })()}
{(() => {
                  const stepText = locale === 'en' ? 'Step' : locale === 'es' ? 'Paso' : locale === 'fr' ? 'Étape' : 'Step';
                  const ofText = locale === 'en' ? 'of 4' : locale === 'es' ? 'de 4' : locale === 'fr' ? 'sur 4' : 'of 4';
                  const stepNumber = currentStep === 'upload' ? '1' : currentStep === 'configure' ? '2' : currentStep === 'processing' ? '3' : '4';
                  console.log('🐛 DEBUG - Step Info:', `${stepText} ${stepNumber} ${ofText}`, '(locale:', locale + ')');
                  return (
                    <p className="text-sm text-gray-600">{stepText} {stepNumber} {ofText}</p>
                  );
                })()}
              </div>
            </div>
            
            {currentStep !== 'upload' && (
              <button
                onClick={resetToStart}
                className="flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/70 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4" />
{(() => {
                  const newImageText = locale === 'en' ? 'New Image' : locale === 'es' ? 'Nueva Imagen' : locale === 'fr' ? 'Nouvelle Image' : 'New Image';
                  console.log('🐛 DEBUG - New Image Button:', newImageText, '(locale:', locale + ')');
                  return <span>{newImageText}</span>;
                })()}
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
{(() => {
                const statsText = locale === 'en' ? '5M+ Images Resized • AI Powered' : locale === 'es' ? '5M+ Imágenes Redimensionadas • Con IA' : locale === 'fr' ? '5M+ Images Redimensionnées • IA' : '5M+ Resim Boyutlandırıldı • AI Destekli';
                console.log('🐛 DEBUG - Stats Text:', statsText, '(locale:', locale + ')');
                return statsText;
              })()}
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
{(() => {
                  const mainTitle = locale === 'en' ? '📐 Image Resize' : locale === 'es' ? '📐 Redimensionar Imagen' : locale === 'fr' ? '📐 Redimensionner Image' : '📐 Image Resize';
                  console.log('🐛 DEBUG - Main Title:', mainTitle, '(locale:', locale + ')');
                  return mainTitle;
                })()}
              </span>
            </h1>
            
            {(() => {
                const descriptionText = locale === 'en' ? 'Resize your images to any dimension with precision and quality' : locale === 'es' ? 'Redimensiona tus imágenes a cualquier dimensión con precisión y calidad' : locale === 'fr' ? 'Redimensionnez vos images à toute dimension avec précision et qualité' : 'Resize your images to any dimension with precision and quality';
                console.log('🐛 DEBUG - Description:', descriptionText, '(locale:', locale + ')');
                return (
                  <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    {descriptionText}
                  </p>
                );
              })()}
          </div>

          {/* Enhanced Upload Area */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Orbital rings */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 border-2 border-purple-200/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-4 border-2 border-pink-200/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              </div>
              
              {/* Floating sparkles */}
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
                
{(() => {
                  const uploadTitle = isDragActive 
                    ? (locale === 'en' ? 'Drop your image here' : locale === 'es' ? 'Suelta tu imagen aquí' : locale === 'fr' ? 'Déposez votre image ici' : 'Drop your image here')
                    : (locale === 'en' ? 'Select Image to Resize' : locale === 'es' ? 'Seleccionar Imagen para Redimensionar' : locale === 'fr' ? 'Sélectionner Image à Redimensionner' : 'Select Image to Resize');
                  console.log('🐛 DEBUG - Upload Title:', uploadTitle, '(locale:', locale + ')');
                  return (
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {uploadTitle}
                    </h3>
                  );
                })()}
{(() => {
                  const formatText = locale === 'en' ? 'PNG, JPEG, WebP, GIF • Up to 50MB' : locale === 'es' ? 'PNG, JPEG, WebP, GIF • Hasta 50MB' : locale === 'fr' ? 'PNG, JPEG, WebP, GIF • Jusqu\'à 50MB' : 'PNG, JPEG, WebP, GIF • Up to 50MB';
                  console.log('🐛 DEBUG - Format Text:', formatText, '(locale:', locale + ')');
                  return (
                    <p className="text-gray-600 mb-6">
                      {formatText}
                    </p>
                  );
                })()}
                
{(() => {
                  const chooseFileText = locale === 'en' ? 'Choose File' : locale === 'es' ? 'Elegir Archivo' : locale === 'fr' ? 'Choisir Fichier' : 'Choose File';
                  console.log('🐛 DEBUG - Choose File Button:', chooseFileText, '(locale:', locale + ')');
                  return (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 inline-block">
                      {chooseFileText}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🔒</div>
{(() => {
                  const secureText = locale === 'en' ? 'Secure Processing' : locale === 'es' ? 'Procesamiento Seguro' : locale === 'fr' ? 'Traitement Sécurisé' : 'Secure Processing';
                  console.log('🐛 DEBUG - Secure Processing Text:', secureText, '(locale:', locale + ')');
                  return <p className="text-sm font-medium text-gray-700">{secureText}</p>;
                })()}
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">⚡</div>
{(() => {
                  const fastText = locale === 'en' ? 'Lightning Fast' : locale === 'es' ? 'Súper Rápido' : locale === 'fr' ? 'Très Rapide' : 'Lightning Fast';
                  console.log('🐛 DEBUG - Lightning Fast Text:', fastText, '(locale:', locale + ')');
                  return <p className="text-sm font-medium text-gray-700">{fastText}</p>;
                })()}
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🎯</div>
{(() => {
                  const pixelText = locale === 'en' ? 'Pixel Perfect' : locale === 'es' ? 'Píxel Perfecto' : locale === 'fr' ? 'Pixel Parfait' : 'Pixel Perfect';
                  console.log('🐛 DEBUG - Pixel Perfect Text:', pixelText, '(locale:', locale + ')');
                  return <p className="text-sm font-medium text-gray-700">{pixelText}</p>;
                })()}
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
{(() => {
                    const configureTitle = locale === 'en' ? 'Configure Resize Settings' : locale === 'es' ? 'Configurar Ajustes de Redimensión' : locale === 'fr' ? 'Configurer Paramètres Redimensionnement' : 'Configure Resize Settings';
                    console.log('🐛 DEBUG - Configure Title:', configureTitle, '(locale:', locale + ')');
                    return (
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {configureTitle}
                      </h2>
                    );
                  })()}
{(() => {
                      const configureDesc = locale === 'en' ? 'Set your desired dimensions and options' : locale === 'es' ? 'Establece tus dimensiones y opciones deseadas' : locale === 'fr' ? 'Définissez vos dimensions et options souhaitées' : 'Set your desired dimensions and options';
                      console.log('🐛 DEBUG - Configure Description:', configureDesc, '(locale:', locale + ')');
                      return <p className="text-gray-600">{configureDesc}</p>;
                    })()}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left: Interactive Preview (3/5) */}
                  <div className="lg:col-span-3">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
{(() => {
                        const previewTitle = locale === 'en' ? 'Live Preview' : locale === 'es' ? 'Vista Previa en Vivo' : locale === 'fr' ? 'Aperçu en Direct' : 'Live Preview';
                        console.log('🐛 DEBUG - Live Preview Title:', previewTitle, '(locale:', locale + ')');
                        return <h3 className="font-semibold text-gray-900 mb-4 text-center">{previewTitle}</h3>;
                      })()}
                      {(() => {
                          const previewInstructions = locale === 'en' ? '🎯 Adjust dimensions using controls on the right and see live preview' : locale === 'es' ? '🎯 Ajusta las dimensiones usando los controles de la derecha y ve la vista previa en vivo' : locale === 'fr' ? '🎯 Ajustez les dimensions avec les contrôles de droite et voyez l\'aperçu en direct' : '🎯 Adjust dimensions using controls on the right and see live preview';
                          console.log('🐛 DEBUG - Preview Instructions:', previewInstructions, '(locale:', locale + ')');
                          return (
                            <p className="text-sm text-gray-600 mb-4 text-center">
                              {previewInstructions}
                            </p>
                          );
                        })()}
                      <SimplePreviewBox
                        imageUrl={URL.createObjectURL(file)}
                        originalDimensions={originalDimensions}
                        width={width}
                        height={height}
                        getText={getText}
                      />
                      <div className="mt-4 text-sm text-gray-700 text-center bg-white rounded-lg p-3">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-gray-600">{formatFileSize(file.size)} • Original: {originalDimensions.width}×{originalDimensions.height}</p>
                        <p className="text-purple-600 font-medium">Current: {width || originalDimensions.width}×{height || originalDimensions.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Settings (2/5) */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      
                      {/* Resize Mode Toggle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{locale === 'en' ? 'Resize Mode' : locale === 'es' ? 'Modo de Redimensión' : 'Resize Mode'}</label>
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setResizeMode('pixels')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'pixels'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {locale === 'en' ? 'By Pixels' : locale === 'es' ? 'Por Píxeles' : 'By Pixels'}
                          </button>
                          <button
                            onClick={() => setResizeMode('percentage')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'percentage'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {locale === 'en' ? 'By Percentage' : locale === 'es' ? 'Por Porcentaje' : 'By Percentage'}
                          </button>
                        </div>
                      </div>

                      {/* Resize Controls */}
                      {resizeMode === 'pixels' ? (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {locale === 'en' ? 'Width (px)' : locale === 'es' ? 'Ancho (px)' : 'Width (px)'}
                            </label>
                            <input
                              type="number"
                              value={width || ''}
                              onChange={(e) => handleWidthChange(e.target.value)}
                              onFocus={(e) => {
                                if (e.target.placeholder) {
                                  e.target.setAttribute('data-placeholder', e.target.placeholder);
                                  e.target.placeholder = '';
                                }
                              }}
                              onBlur={(e) => {
                                if (!e.target.value && e.target.getAttribute('data-placeholder')) {
                                  e.target.placeholder = e.target.getAttribute('data-placeholder') || '';
                                }
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-800"
                              placeholder={locale === 'en' ? 'Enter width...' : locale === 'es' ? 'Ingresa ancho...' : 'Enter width...'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {locale === 'en' ? 'Height (px)' : locale === 'es' ? 'Alto (px)' : 'Height (px)'}
                            </label>
                            <input
                              type="number"
                              value={height || ''}
                              onChange={(e) => handleHeightChange(e.target.value)}
                              onFocus={(e) => {
                                if (e.target.placeholder) {
                                  e.target.setAttribute('data-placeholder', e.target.placeholder);
                                  e.target.placeholder = '';
                                }
                              }}
                              onBlur={(e) => {
                                if (!e.target.value && e.target.getAttribute('data-placeholder')) {
                                  e.target.placeholder = e.target.getAttribute('data-placeholder') || '';
                                }
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-800"
                              placeholder={locale === 'en' ? 'Enter height...' : locale === 'es' ? 'Ingresa alto...' : 'Enter height...'}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'en' ? 'Resize to % of original' : locale === 'es' ? 'Redimensionar al % del original' : 'Resize to % of original'}
                          </label>
                          <input
                            type="number"
                            value={percentageValue || ''}
                            onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 100)}
                            onFocus={(e) => {
                              if (e.target.placeholder) {
                                e.target.setAttribute('data-placeholder', e.target.placeholder);
                                e.target.placeholder = '';
                              }
                            }}
                            onBlur={(e) => {
                              if (!e.target.value && e.target.getAttribute('data-placeholder')) {
                                e.target.placeholder = e.target.getAttribute('data-placeholder') || '';
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-800"
                            min="1"
                            max="500"
                            placeholder={locale === 'en' ? 'Enter percentage...' : locale === 'es' ? 'Ingresa porcentaje...' : 'Enter percentage...'}
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="text-purple-600 font-medium">
                              {locale === 'en' ? 'Result:' : locale === 'es' ? 'Resultado:' : 'Result:'} {Math.round(originalDimensions.width * (percentageValue / 100))}×{Math.round(originalDimensions.height * (percentageValue / 100))}
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
                          <span className="text-sm text-gray-700">{locale === 'en' ? 'Maintain aspect ratio' : locale === 'es' ? 'Mantener relación de aspecto' : 'Maintain aspect ratio'}</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={doNotEnlarge}
                            onChange={(e) => setDoNotEnlarge(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{locale === 'en' ? 'Do not enlarge if smaller' : locale === 'es' ? 'No agrandar si es más pequeño' : 'Do not enlarge if smaller'}</span>
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
{(() => {
                          const startText = locale === 'en' ? '🚀 Start Resizing' : locale === 'es' ? '🚀 Comenzar Redimensión' : locale === 'fr' ? '🚀 Commencer le Redimensionnement' : '🚀 Start Resizing';
                          console.log('🐛 DEBUG - Start Resizing Button:', startText, '(locale:', locale + ')');
                          return <span>{startText}</span>;
                        })()}
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
                  {/* Multiple rotating rings - larger and more prominent */}
                  <div className="relative mb-12">
                    <div className="w-40 h-40 mx-auto relative">
                      <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                      <div className="absolute inset-2 border-4 border-pink-300 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-4 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                      <div className="absolute inset-6 border-4 border-pink-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                      
                      {/* Center icon - larger */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="h-16 w-16 text-purple-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
{(() => {
                    const processingTitle = locale === 'en' ? '🤖 AI Resizing Your Image' : locale === 'es' ? '🤖 IA Redimensionando tu Imagen' : locale === 'fr' ? '🤖 IA Redimensionne Votre Image' : '🤖 AI Resizing Your Image';
                    console.log('🐛 DEBUG - Processing Title:', processingTitle, '(locale:', locale + ')');
                    return (
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                        {processingTitle}
                      </h3>
                    );
                  })()}
                  
{(() => {
                    const processingDesc = locale === 'en' ? 'Please wait while we process your image with precision...' : locale === 'es' ? 'Por favor espera mientras procesamos tu imagen con precisión...' : locale === 'fr' ? 'Veuillez patienter pendant que nous traitons votre image avec précision...' : 'Please wait while we process your image with precision...';
                    console.log('🐛 DEBUG - Processing Description:', processingDesc, '(locale:', locale + ')');
                    return (
                      <p className="text-xl text-gray-700 mb-8 font-medium">
                        {processingDesc}
                      </p>
                    );
                  })()}
                  
                  {/* Progress bar with shimmer - larger */}
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                    <div 
                      className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative shadow-lg"
                      style={{ width: `${processingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
{(() => {
                    const completeText = locale === 'en' ? 'Complete' : locale === 'es' ? 'Completo' : locale === 'fr' ? 'Terminé' : 'Complete';
                    console.log('🐛 DEBUG - Complete Text:', `${processingProgress}% ${completeText}`, '(locale:', locale + ')');
                    return <p className="text-lg text-purple-600 font-semibold">{processingProgress}% {completeText}</p>;
                  })()}
                  
                  {/* Processing status */}
                  <div className="mt-8 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
{(() => {
                        const getProcessingStatus = () => {
                          if (processingProgress < 15) {
                            return locale === 'en' ? 'Analyzing image...' : locale === 'es' ? 'Analizando imagen...' : locale === 'fr' ? 'Analyse de l\'image...' : 'Analyzing image...';
                          } else if (processingProgress < 35) {
                            return locale === 'en' ? 'Preparing resize...' : locale === 'es' ? 'Preparando redimensión...' : locale === 'fr' ? 'Préparation du redimensionnement...' : 'Preparing resize...';
                          } else if (processingProgress < 60) {
                            return locale === 'en' ? 'Calculating dimensions...' : locale === 'es' ? 'Calculando dimensiones...' : locale === 'fr' ? 'Calcul des dimensions...' : 'Calculating dimensions...';
                          } else if (processingProgress < 85) {
                            return locale === 'en' ? 'Resizing image...' : locale === 'es' ? 'Redimensionando imagen...' : locale === 'fr' ? 'Redimensionnement de l\'image...' : 'Resizing image...';
                          } else {
                            return locale === 'en' ? 'Finalizing...' : locale === 'es' ? 'Finalizando...' : locale === 'fr' ? 'Finalisation...' : 'Finalizing...';
                          }
                        };
                        const statusText = getProcessingStatus();
                        console.log('🐛 DEBUG - Processing Status:', statusText, '(locale:', locale + ')');
                        return <span className="text-purple-700 font-medium">{statusText}</span>;
                      })()}
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
                    
{(() => {
                      const resultTitle = locale === 'en' ? '✅ Resize Complete!' : locale === 'es' ? '✅ ¡Redimensión Completa!' : locale === 'fr' ? '✅ Redimensionnement Terminé !' : '✅ Resize Complete!';
                      console.log('🐛 DEBUG - Result Title:', resultTitle, '(locale:', locale + ')');
                      return (
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                          {resultTitle}
                        </h2>
                      );
                    })()}
{(() => {
                      const resultDesc = locale === 'en' ? 'Your image has been resized successfully' : locale === 'es' ? 'Tu imagen ha sido redimensionada exitosamente' : locale === 'fr' ? 'Votre image a été redimensionnée avec succès' : 'Your image has been resized successfully';
                      console.log('🐛 DEBUG - Result Description:', resultDesc, '(locale:', locale + ')');
                      return <p className="text-gray-600">{resultDesc}</p>;
                    })()}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Before */}
                    <div className="text-center">
{(() => {
                        const originalText = locale === 'en' ? 'Original' : locale === 'es' ? 'Original' : locale === 'fr' ? 'Original' : 'Original';
                        console.log('🐛 DEBUG - Original Text:', originalText, '(locale:', locale + ')');
                        return <h3 className="font-semibold text-gray-900 mb-4">{originalText}</h3>;
                      })()}
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
{(() => {
                        const resizedText = locale === 'en' ? 'Resized' : locale === 'es' ? 'Redimensionada' : locale === 'fr' ? 'Redimensionnée' : 'Resized';
                        console.log('🐛 DEBUG - Resized Text:', resizedText, '(locale:', locale + ')');
                        return <h3 className="font-semibold text-gray-900 mb-4">{resizedText}</h3>;
                      })()}
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
{(() => {
                        const downloadText = locale === 'en' ? '📥 Download Resized Image' : locale === 'es' ? '📥 Descargar Imagen Redimensionada' : locale === 'fr' ? '📥 Télécharger l\'Image Redimensionnée' : '📥 Download Resized Image';
                        console.log('🐛 DEBUG - Download Button:', downloadText, '(locale:', locale + ')');
                        return <span>{downloadText}</span>;
                      })()}
                    </button>
                    
                    <button
                      onClick={resetToStart}
                      className="text-gray-600 hover:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
{(() => {
                        const anotherText = locale === 'en' ? 'Resize Another Image' : locale === 'es' ? 'Redimensionar Otra Imagen' : locale === 'fr' ? 'Redimensionner une Autre Image' : 'Resize Another Image';
                        console.log('🐛 DEBUG - Another Image Button:', anotherText, '(locale:', locale + ')');
                        return anotherText;
                      })()}
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