'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  CloudArrowUpIcon, 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CpuChipIcon,
  CircleStackIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  CpuChipIcon as CpuChipIconSolid,
  SparklesIcon as SparklesIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';
import FileUpload from '@/components/FileUpload';
import StructuredData from '@/components/StructuredData';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { getTranslations } from '@/lib/translations';

interface CompressionResult {
  file: File;
  originalFile?: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
}

// Server compression options
interface ServerCompressionOptions {
  quality: number;
  format: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC';
  mode: 'balanced' | 'aggressive';
}

// AI Processing Animation Component
function AIProcessingIndicator() {
  return (
    <div className="relative">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-4 gap-2 h-full">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i}
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* AI Brain Icon */}
      <div className="relative z-10 flex items-center justify-center h-32">
        <div className="relative">
          <CpuChipIconSolid className="h-16 w-16 text-purple-600 animate-pulse" />
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 300}ms`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// AI Smart Badge Component
function AISmartBadge({ icon: Icon, text, delay = 0 }: { icon: any, text: string, delay?: number }) {
  return (
    <div 
      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg animate-slide-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{text}</span>
      <SparklesIconSolid className="h-3 w-3 animate-pulse" />
    </div>
  );
}

// Floating AI Elements
function FloatingAIElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating brain chips */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            top: `${20 + i * 30}%`,
            left: `${10 + i * 25}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: '6s'
          }}
        >
          <CpuChipIcon className="h-8 w-8 text-purple-300 opacity-30" />
        </div>
      ))}
      
      {/* Floating sparkles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-bounce"
          style={{
            top: `${15 + i * 20}%`,
            right: `${5 + i * 15}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: '3s'
          }}
        >
          <SparklesIcon className="h-6 w-6 text-pink-300 opacity-40" />
        </div>
      ))}
    </div>
  );
}

export default async function ImageCompressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ImageCompress locale={locale} />;
}

function ImageCompress({ locale }: { locale: string }) {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Enhanced Translation helper with Spanish support
  const t = getTranslations(locale);
  
  // Helper function for multi-language fallbacks including French  
  const getFallbackText = (trText: string, enText: string, esText?: string, frText?: string, deText?: string) => {
    console.log(`🖼️ IMAGE COMPRESS DEBUG - getFallbackText called for locale: ${locale}`);
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
        console.log(`🇫🇷 FRENCH DETECTED - Using: ${result}`);
        break;
      case 'de': 
        result = deText || enText;
        break;
      default: 
        result = enText;
    }
    
    console.log(`  → Selected: ${result}`);
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
    
    // Manual AI-themed translations with French support
    const aiTranslations: { [key: string]: () => string } = {
      'ai.poweredBy': () => getFallbackText('Yapay Zeka Destekli', 'AI-Powered', 'Con IA', 'Alimenté par IA'),
      'ai.smartCompression': () => getFallbackText('Akıllı Sıkıştırma', 'Smart Compression', 'Compresión Inteligente', 'Compression Intelligente'),
      'ai.analyzing': () => getFallbackText('AI Analiz Ediyor...', 'AI Analyzing...', 'IA Analizando...', 'IA en cours d\'Analyse...'),
      'ai.optimizing': () => getFallbackText('AI Optimize Ediyor...', 'AI Optimizing...', 'IA Optimizando...', 'IA en cours d\'Optimisation...'),
      'ai.processing': () => getFallbackText('AI İşliyor...', 'AI Processing...', 'IA Procesando...', 'IA en cours de Traitement...'),
      'ai.intelligent': () => getFallbackText('Akıllı Algoritma', 'Intelligent Algorithm', 'Algoritmo Inteligente', 'Algorithme Intelligent'),
      'ai.advanced': () => getFallbackText('Gelişmiş AI', 'Advanced AI', 'IA Avanzada', 'IA Avancée'),
      'ai.quality': () => getFallbackText('AI Kalite Kontrolü', 'AI Quality Control', 'Control de Calidad con IA', 'Contrôle Qualité IA'),
      
      // Main content with French translations
      'imageCompress.title': () => getFallbackText('AI Destekli Resim Sıkıştırma', 'AI-Powered Image Compression', 'Compresión de Imágenes con IA', 'Compression d\'Images avec IA'),
      'imageCompress.subtitle': () => getFallbackText(
        'Yapay zeka teknolojisi ile resimlerinizi maksimum kalitede sıkıştırın',
        'Compress your images with maximum quality using AI technology',
        'Comprime tus imágenes con máxima calidad usando tecnología de IA',
        'Compressez vos images avec une qualité maximale en utilisant la technologie IA'
      ),
      
      // Step titles for consistent step labeling
      'step.upload': () => getFallbackText('1. Dosya Yükle', '1. Upload File', '1. Subir Archivo', '1. Télécharger Fichier'),
      'step.processing': () => getFallbackText('2. AI İşleme', '2. AI Processing', '2. Procesamiento con IA', '2. Traitement IA'),
      'step.download': () => getFallbackText('3. İndir', '3. Download', '3. Descargar', '3. Télécharger'),
      
      'fileUpload.title': () => getFallbackText('Resminizi Seçin', 'Select Your Image', 'Selecciona tu Imagen', 'Sélectionnez votre Image'),
      'fileUpload.description': () => getFallbackText('Sıkıştırılacak resim dosyasını seçin', 'Choose an image file to compress', 'Elige un archivo de imagen para comprimir', 'Choisissez un fichier image à compresser'),
      
      'processing.analyzing': () => getFallbackText('AI resminizi analiz ediyor...', 'AI is analyzing your image...', 'La IA está analizando tu imagen...', 'L\'IA analyse votre image...'),
      'processing.complete': () => getFallbackText('Tamamlandı', 'Complete', 'Completado', 'Terminé'),
      
      'result.success': () => getFallbackText('AI Sıkıştırma Tamamlandı!', 'AI Compression Complete!', '¡Compresión con IA Completada!', 'Compression IA Terminée!'),
      'result.download': () => getFallbackText('Sıkıştırılmış Resmi İndir', 'Download Compressed Image', 'Descargar Imagen Comprimida', 'Télécharger Image Compressée'),
      'result.newCompression': () => getFallbackText('Yeni Resim Sıkıştır', 'Compress New Image', 'Comprimir Nueva Imagen', 'Compresser Nouvelle Image'),
      'result.originalSize': () => getFallbackText('Orijinal Boyut', 'Original Size', 'Tamaño Original', 'Taille Originale'),
      'result.compressedSize': () => getFallbackText('Sıkıştırılmış Boyut', 'Compressed Size', 'Tamaño Comprimido', 'Taille Compressée'),
      'result.savings': () => getFallbackText('Tasarruf', 'Space Saved', 'Espacio Ahorrado', 'Espace Économisé'),
      
      'features.intelligent': () => getFallbackText('Akıllı Sıkıştırma', 'Intelligent Compression', 'Compresión Inteligente', 'Compression Intelligente'),
      'features.intelligentDesc': () => getFallbackText('AI her resim için en uygun ayarları belirler', 'AI determines optimal settings for each image', 'La IA determina la configuración óptima para cada imagen', 'L\'IA détermine les paramètres optimaux pour chaque image'),
      'features.quality': () => getFallbackText('Kalite Korunması', 'Quality Preservation', 'Preservación de Calidad', 'Préservation de la Qualité'),
      'features.qualityDesc': () => getFallbackText('Görsel kaliteyi maksimum düzeyde korur', 'Preserves visual quality at maximum level', 'Preserva la calidad visual al máximo nivel', 'Préserve la qualité visuelle au niveau maximum'),
      'features.speed': () => getFallbackText('Hızlı İşlem', 'Fast Processing', 'Procesamiento Rápido', 'Traitement Rapide'),
      'features.speedDesc': () => getFallbackText('Saniyeler içinde profesyonel sonuçlar', 'Professional results in seconds', 'Resultados profesionales en segundos', 'Résultats professionnels en quelques secondes')
    };
    
    // Check AI translations first, then return fallback
    if (aiTranslations[key]) {
      return aiTranslations[key]();
    }
    
         return fallback;
   };

  // Debug logging for translation testing with French support
  useEffect(() => {
    console.log('🖼️ IMAGE COMPRESS DEBUG - Enhanced Translation System:');
    console.log('  - Current locale:', locale);
    console.log('  - Browser language:', typeof navigator !== 'undefined' ? navigator.language : 'server-side');
    console.log('  - Browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'server-side');
    console.log('  - URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server-side');
    console.log('  - Is French detected:', typeof navigator !== 'undefined' ? navigator.language.startsWith('fr') : false);
    
    console.log('🖼️ IMAGE COMPRESS DEBUG - Sample Translation Values:');
    console.log('  - Title:', getText('imageCompress.title', 'AI-Powered Image Compression'));
    console.log('  - Step Upload:', getText('step.upload', '1. Upload File'));
    console.log('  - Step Processing:', getText('step.processing', '2. AI Processing'));
    console.log('  - Step Download:', getText('step.download', '3. Download'));
    console.log('  - AI Powered:', getText('ai.poweredBy', 'AI-Powered'));
    console.log('  - Processing Text:', getText('processing.analyzing', 'AI is analyzing your image...'));
    console.log('  - Success Text:', getText('result.success', 'AI Compression Complete!'));
    console.log('  - French support ready and active');
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
        
        console.log('🌍 IMAGE COMPRESS DEBUG - Browser Language Auto-Detection:', {
          currentPath,
          browserLanguage,
          preferredLanguage,
          supportedLanguages,
          willRedirect: supportedLanguages.includes(preferredLanguage || browserLanguage)
        });
        
        if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
          console.log('🌍 Redirecting to preferred language:', preferredLanguage);
          window.location.href = `/${preferredLanguage}/image-compress`;
          return;
        }
        
        if (supportedLanguages.includes(browserLanguage)) {
          console.log('🌍 Redirecting to browser language:', browserLanguage);
          localStorage.setItem('quickutil_preferred_locale', browserLanguage);
          window.location.href = `/${browserLanguage}/image-compress`;
          return;
        }
        
        // Default to English if no match
        console.log('🌍 Defaulting to English');
        localStorage.setItem('quickutil_preferred_locale', 'en');
        window.location.href = '/en/image-compress';
      }
    };

    detectAndRedirectLanguage();
  }, []);

  // Component state - Simplified 3-step flow: upload -> processing -> result
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [heicNotification, setHeicNotification] = useState<string | null>(null);
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when step changes - Improved for better UX
  useEffect(() => {
    const scrollToStep = () => {
      let targetElement: HTMLDivElement | null = null;
      
      switch (currentStep) {
        case 'upload':
          targetElement = uploadRef.current;
          break;
        case 'processing':
          targetElement = processingRef.current;
          break;
        case 'result':
          targetElement = resultRef.current;
          break;
      }
      
      if (targetElement) {
        // Smooth scroll with proper offset for mobile
        setTimeout(() => {
          const offsetTop = targetElement!.offsetTop - 80; // Account for header
          window.scrollTo({ 
            top: offsetTop, 
            behavior: 'smooth' 
          });
        }, 300);
      }
    };

    scrollToStep();
  }, [currentStep]);

  const handleFileSelect = async (file: File) => {
    console.log('File selected:', file.name);
    setSelectedFile(file);
    setError(null);
    setCurrentStep('upload');
    
    // Check if HEIC
    if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
      setHeicNotification(getFallbackText('HEIC dosyalar PNG formatına dönüştürülecek', 'HEIC files will be converted to PNG format', 'Los archivos HEIC se convertirán a formato PNG', 'Les fichiers HEIC seront convertis au format PNG'));
    }
    
    // Auto-start compression after short delay
    setTimeout(async () => {
      await handleCompress(file);
    }, 800);
  };

  const handleCompress = async (file?: File) => {
    const fileToCompress = file || selectedFile;
    if (!fileToCompress) return;

    // Check quota before processing
    const canProcess = await canUseFeature('image_compress');
    if (!canProcess) {
      if (!user) {
        setShowAuthModal(true);
        return;
      } else {
        setError(getFallbackText('Günlük limit aşıldı. Premium hesaba geçin.', 'Daily limit exceeded. Upgrade to Premium.', 'Límite diario excedido. Actualiza a Premium.', 'Limite quotidien dépassé. Passez à Premium.'));
        return;
      }
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    setError(null);
    setProcessingProgress(0);

    try {
      // AI Processing simulation with progress
      const progressSteps = [10, 25, 50, 75, 90];
      for (let i = 0; i < progressSteps.length; i++) {
        setProcessingProgress(progressSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Auto-detect format from file
      const fileExtension = fileToCompress.name.split('.').pop()?.toLowerCase();
      let autoFormat: 'JPEG' | 'PNG' | 'WEBP' | 'HEIC' = 'JPEG';
      
      if (fileExtension === 'png') autoFormat = 'PNG';
      else if (fileExtension === 'webp') autoFormat = 'WEBP';  
      else if (fileExtension === 'heic' || fileExtension === 'heif') autoFormat = 'HEIC';
      else autoFormat = 'JPEG';

      // Server compression with AI-optimized settings
      const serverOptions: ServerCompressionOptions = {
        quality: 80, // AI-optimized quality
        format: autoFormat, // Keep original format
        mode: 'aggressive' as const
      };

      const serverResult = await compressImageOnServer(fileToCompress, serverOptions);
      
      if (serverResult.success && serverResult.compressedBlob) {
        const compressionRatio = ((fileToCompress.size - serverResult.compressedBlob.size) / fileToCompress.size) * 100;
        
        setCompressionResult({
          file: fileToCompress,
          originalFile: fileToCompress,
          compressedBlob: serverResult.compressedBlob,
          originalSize: fileToCompress.size,
          compressedSize: serverResult.compressedBlob.size,
          compressionRatio,
          downloadUrl: URL.createObjectURL(serverResult.compressedBlob)
        });

        setProcessingProgress(100);

        setTimeout(() => {
          setCurrentStep('result');
        }, 500);
      } else {
        throw new Error(serverResult.error || getFallbackText('Sıkıştırma başarısız', 'Compression failed', 'Compresión fallida', 'Compression échouée'));
      }
    } catch (err) {
      console.error('Compression error:', err);
      setError(err instanceof Error ? err.message : getFallbackText('Bilinmeyen hata', 'Unknown error', 'Error desconocido', 'Erreur inconnue'));
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setCurrentStep('upload');
    setError(null);
    setProcessingProgress(0);
    setHeicNotification(null);
    
    // Clean up object URLs
    if (compressionResult?.downloadUrl) {
      URL.revokeObjectURL(compressionResult.downloadUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Server compression function - Fixed form data handling
  async function compressImageOnServer(file: File, options: ServerCompressionOptions) {
    try {
      console.log('Compressing on server with options:', options);
      
          const formData = new FormData();
    formData.append('file', file); // ✅ Backend 'file' key'ini bekliyor
    formData.append('quality', options.quality.toString());
    formData.append('format', options.format.toLowerCase()); // Convert to lowercase
    formData.append('mode', options.mode);

      console.log('Sending request to quickutil-image-api...');
      const response = await fetch('https://quickutil-image-api.onrender.com/compress', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const compressedBlob = await response.blob();
      console.log('Compression successful, blob size:', compressedBlob.size);
      
      return { success: true, compressedBlob };
    } catch (error) {
      console.error('Server compression error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Compression failed' 
      };
    }
  }

  return (
    <>
      <StructuredData type="tool" />

      {/* Responsive container with better mobile experience */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
        {/* Floating AI Background Elements */}
        <FloatingAIElements />
        
        {/* Hero Section with AI Theme - Responsive */}
        <div className="relative pt-16 md:pt-20 pb-8 md:pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* AI Badge - Responsive */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 rounded-full shadow-lg mb-4 md:mb-6 animate-bounce-in text-sm md:text-base">
              <CpuChipIconSolid className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-medium">{getText('ai.poweredBy', 'AI-Powered')}</span>
              <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
            </div>
            
            {/* Title - Responsive */}
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 px-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                {getText('imageCompress.title', 'AI-Powered Image Compression')}
              </span>
            </h1>
            
            {/* Subtitle - Responsive */}
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
              {getText('imageCompress.subtitle', 'Compress your images with maximum quality using AI technology')}
            </p>

            {/* AI Features - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12 px-2">
              <AISmartBadge 
                icon={BeakerIconSolid} 
                text={getText('features.intelligent', 'Intelligent Compression')} 
                delay={0}
              />
              <AISmartBadge 
                icon={SparklesIconSolid} 
                text={getText('features.quality', 'Quality Preservation')} 
                delay={200}
              />
              <AISmartBadge 
                icon={BoltIcon} 
                text={getText('features.speed', 'Fast Processing')} 
                delay={400}
              />
            </div>
          </div>
        </div>

        {/* Main Content Container - Responsive */}
        <div className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
          {/* Upload Step - Responsive */}
          {currentStep === 'upload' && (
            <div ref={uploadRef} className="animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-4 md:p-8 mb-6 md:mb-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-purple-100 to-pink-100 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl mb-4">
                    <CircleStackIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    <span className="text-base md:text-lg font-semibold text-purple-800">
                      {getText('ai.smartCompression', 'Smart Compression')}
                    </span>
                  </div>
                </div>

                <FileUpload
                  onFileSelect={(file) => {
                    const selectedFile = Array.isArray(file) ? file[0] : file;
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']}
                  maxSize={20 * 1024 * 1024} // 20MB
                  title={getText('fileUpload.title', 'Select Your Image')}
                  description={getText('fileUpload.description', 'Choose an image file to compress and optimize')}
                />

                {/* AI Features Grid - Responsive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl border border-purple-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <CpuChipIconSolid className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('features.intelligent', 'Intelligent Compression')}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-700">
                      {getText('features.intelligentDesc', 'AI determines optimal settings for each image')}
                    </p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl md:rounded-2xl border border-pink-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <SparklesIconSolid className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-pink-900 mb-2 text-sm md:text-base">
                      {getText('features.quality', 'Quality Preservation')}
                    </h3>
                    <p className="text-xs md:text-sm text-pink-700">
                      {getText('features.qualityDesc', 'Preserves visual quality at maximum level')}
                    </p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl md:rounded-2xl border border-purple-200">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <BoltIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('features.speed', 'Fast Processing')}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-700">
                      {getText('features.speedDesc', 'Professional results in seconds')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message - Responsive */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 md:h-6 md:w-6 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 font-medium text-sm md:text-base">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Processing Step - Responsive */}
          {currentStep === 'processing' && (
            <div ref={processingRef} className="text-center animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12 mb-6 md:mb-8 mx-auto max-w-2xl">
                <div className="max-w-md mx-auto">
                  {/* AI Processing Animation */}
                  <AIProcessingIndicator />
                  
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    {getText('ai.processing', 'AI Processing...')}
                  </h2>
                  <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                    {getText('processing.analyzing', 'AI is analyzing your image...')}
                  </p>

                  {/* AI Progress Bar - Responsive */}
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-4 md:mb-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 md:h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${processingProgress}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">
                    {processingProgress}% {getText('processing.complete', 'Complete')}
                  </p>

                  {/* AI Processing Badges - Responsive */}
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 md:mt-8">
                    <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 md:px-4 py-2 rounded-full">
                      <BeakerIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm">{getText('ai.intelligent', 'Intelligent Algorithm')}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-pink-100 text-pink-800 px-3 md:px-4 py-2 rounded-full">
                      <LightBulbIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm">{getText('ai.quality', 'AI Quality Control')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Success Result Step - Responsive */}
          {currentStep === 'result' && compressionResult && (
            <div ref={resultRef} className="animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-white/50 p-4 md:p-8 mb-6 md:mb-8">
                {/* Success Header with AI Theme - Responsive */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 md:mb-6 animate-bounce-in">
                    <CheckCircleIcon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    {getText('result.success', 'AI Compression Complete!')}
                  </h2>
                  
                  {/* AI Success Badges - Responsive */}
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 md:px-4 py-2 rounded-full">
                      <CpuChipIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm font-medium">{getText('ai.advanced', 'Advanced AI')}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 md:px-4 py-2 rounded-full">
                      <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs md:text-sm font-medium">{getText('ai.quality', 'AI Quality Control')}</span>
                    </div>
                  </div>
                </div>

                {/* Compression Results with AI Styling - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">
                      {getText('result.originalSize', 'Original Size')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-blue-800">
                      {formatFileSize(compressionResult.originalSize)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2 text-sm md:text-base">
                      {getText('result.compressedSize', 'Compressed Size')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-green-800">
                      {formatFileSize(compressionResult.compressedSize)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">
                      {getText('result.savings', 'Space Saved')}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-purple-800">
                      {compressionResult.compressionRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Action Buttons with AI Styling - Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <a
                    href={compressionResult.downloadUrl}
                    download={`compressed_ai_${compressionResult.file.name}`}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 md:space-x-3 group text-sm md:text-base"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce" />
                    <span>{getText('result.download', 'Download Compressed Image')}</span>
                    <SparklesIconSolid className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
                  </a>
                  
                  <button
                    onClick={handleReset}
                    className="bg-white text-purple-600 border-2 border-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm md:text-base"
                  >
                    <CpuChipIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>{getText('result.newCompression', 'Compress New Image')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 