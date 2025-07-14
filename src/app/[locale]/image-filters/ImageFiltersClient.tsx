'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PhotoIcon, 
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentIcon,
  SwatchIcon,
  RectangleGroupIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { getTranslations } from '@/lib/translations';

// Enhanced interfaces
interface FilterConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  vintage: boolean;
  sepia: boolean;
  blackWhite: boolean;
}

interface ConversionResult {
  originalFile: File;
  filteredBlob: Blob;
  originalSize: number;
  filteredSize: number;
  downloadUrl: string;
  appliedFilters: string[];
  processingTime: number;
}

interface ImageFiltersClientProps {
  locale: string;
}

// Default filter configuration
const defaultFilterConfig: FilterConfig = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  hue: 0,
  blur: 0,
  vintage: false,
  sepia: false,
  blackWhite: false
};

// Filter presets
const filterPresets = {
  vibrant: {
    brightness: 1.2,
    contrast: 1.3,
    saturation: 1.4,
    hue: 0,
    blur: 0,
    vintage: false,
    sepia: false,
    blackWhite: false
  },
  soft: {
    brightness: 1.1,
    contrast: 0.9,
    saturation: 0.8,
    hue: 0,
    blur: 1,
    vintage: false,
    sepia: false,
    blackWhite: false
  },
  vintage: {
    brightness: 0.9,
    contrast: 1.1,
    saturation: 0.7,
    hue: 15,
    blur: 0,
    vintage: true,
    sepia: false,
    blackWhite: false
  },
  sharp: {
    brightness: 1,
    contrast: 1.4,
    saturation: 1.1,
    hue: 0,
    blur: 0,
    vintage: false,
    sepia: false,
    blackWhite: false
  }
};

// Canvas-based filter application
const applyCanvasFilters = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement, config: FilterConfig) => {
  // Set canvas size
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Build CSS filter string
  let filterString = '';
  
  if (config.brightness !== 1) filterString += `brightness(${config.brightness}) `;
  if (config.contrast !== 1) filterString += `contrast(${config.contrast}) `;
  if (config.saturation !== 1) filterString += `saturate(${config.saturation}) `;
  if (config.hue !== 0) filterString += `hue-rotate(${config.hue}deg) `;
  if (config.blur > 0) filterString += `blur(${config.blur}px) `;
  
  if (config.sepia) filterString += 'sepia(1) ';
  if (config.blackWhite) filterString += 'grayscale(1) ';
  if (config.vintage) filterString += 'sepia(0.4) contrast(1.2) brightness(0.9) ';
  
  // Apply filter to canvas context
  ctx.filter = filterString;
  
  // Draw image with filters
  ctx.drawImage(img, 0, 0);
  
  // Reset filter for future operations
  ctx.filter = 'none';
};

// Apply filters and return result
const applyFilters = async (file: File, config: FilterConfig): Promise<{ filteredImage: ArrayBuffer; appliedFilters: string[] }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Apply filters using canvas
      applyCanvasFilters(canvas, ctx, img, config);
      
      // Get applied filters list
      const appliedFilters: string[] = [];
      if (config.brightness !== 1) appliedFilters.push('brightness');
      if (config.contrast !== 1) appliedFilters.push('contrast');
      if (config.saturation !== 1) appliedFilters.push('saturation');
      if (config.hue !== 0) appliedFilters.push('hue');
      if (config.blur > 0) appliedFilters.push('blur');
      if (config.vintage) appliedFilters.push('vintage');
      if (config.sepia) appliedFilters.push('sepia');
      if (config.blackWhite) appliedFilters.push('blackWhite');
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          blob.arrayBuffer().then(buffer => {
            resolve({ filteredImage: buffer, appliedFilters });
          });
        }
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Utility functions
const applyPreset = (presetName: keyof typeof filterPresets): FilterConfig => {
  return { ...filterPresets[presetName] };
};

const resetFilters = (): FilterConfig => {
  return { ...defaultFilterConfig };
};

export default function ImageFiltersClient({ locale }: ImageFiltersClientProps) {
  console.log('Image Filters Client Component loaded with locale:', locale);
  
  // Force client-side locale detection and re-render
  const [clientLocale, setClientLocale] = useState(locale);
  
  useEffect(() => {
    // Client-side locale detection for force update
    console.log('🎨 CLIENT-SIDE LOCALE DEBUG:', {
      serverLocale: locale,
      clientLocale,
      windowLocation: typeof window !== 'undefined' ? window.location.pathname : 'server',
      browserLanguage: typeof window !== 'undefined' ? navigator.language : 'server'
    });
    
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const pathParts = path.split('/').filter(Boolean);
      const urlLocale = pathParts[0];
      
      console.log('🎨 PATH ANALYSIS:', {
        path,
        pathParts,
        urlLocale,
        isGermanUrl: urlLocale === 'de'
      });
      
      if (urlLocale && urlLocale !== clientLocale) {
        console.log('🎨 FORCING LOCALE UPDATE:', urlLocale);
        setClientLocale(urlLocale);
      }
    }
  }, [locale, clientLocale]);
  
  const router = useRouter();
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Enhanced browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`));
      
      console.log('🎨 IMAGE FILTERS DEBUG - Enhanced Browser Language Auto-Detection:', {
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
        
        console.log('🎨 IMAGE FILTERS DEBUG - Language Detection Process:', {
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
          console.log('🎨 IMAGE FILTERS DEBUG - Using stored preference:', targetLanguage);
        } 
        // Priority 2: Browser language
        else if (supportedLanguages.includes(browserLanguage)) {
          targetLanguage = browserLanguage;
          localStorage.setItem('quickutil_preferred_locale', targetLanguage);
          console.log('🎨 IMAGE FILTERS DEBUG - Using browser language:', targetLanguage);
        }
        // Priority 3: Check Accept-Language header languages
        else {
          const acceptLanguages = navigator.languages || [];
          for (const lang of acceptLanguages) {
            const shortLang = lang.slice(0, 2).toLowerCase();
            if (supportedLanguages.includes(shortLang)) {
              targetLanguage = shortLang;
              localStorage.setItem('quickutil_preferred_locale', targetLanguage);
              console.log('🎨 IMAGE FILTERS DEBUG - Using Accept-Language:', targetLanguage);
              break;
            }
          }
        }
        
        // Redirect to appropriate language
        const newPath = `/${targetLanguage}${currentPath}`;
        console.log('🎨 IMAGE FILTERS DEBUG - Redirecting:', {
          from: currentPath,
          to: newPath,
          targetLanguage,
          reason: preferredLanguage ? 'stored-preference' : 'browser-detection'
        });
        window.location.href = newPath;
      } else {
        // Log current locale validation
        console.log('🎨 IMAGE FILTERS DEBUG - Locale already in path:', {
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

  // Get translations using clientLocale for accurate detection
  const translations = getTranslations(clientLocale);
  
  console.log('🎨 IMAGE FILTERS TRANSLATION DEBUG:', {
    serverLocale: locale,
    clientLocale,
    translationsUsing: clientLocale,
    sampleTranslation: translations?.['imageFilters.title'] || 'not found',
    timestamp: new Date().toISOString()
  });
  
  // getText function - Support flat key structure  
  const getText = (key: string, fallback?: string): string => {
    try {
      const result = (translations as any)?.[key];
      return typeof result === 'string' ? result : (fallback || key);
    } catch (error) {
      console.error('getText error:', error);
      return fallback || key;
    }
  };

  // Step-based state
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(defaultFilterConfig);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [filteredImageUrl, setFilteredImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [filterResult, setFilterResult] = useState<ConversionResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Refs for auto-focus and canvas
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  // Utility function for file size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Auto-focus system
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else if (currentStep === 'configure' && configureRef.current) {
      setTimeout(() => {
        configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else if (currentStep === 'processing' && processingRef.current) {
      setTimeout(() => {
        processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else if (currentStep === 'result' && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [currentStep]);

  // Handle file selection
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setOriginalImageUrl(imageUrl);
    setFilteredImageUrl(imageUrl);
    setCurrentStep('configure');
  };

  // Real-time preview update
  const updatePreview = (config: FilterConfig) => {
    if (!previewImageRef.current || !previewCanvasRef.current || !file) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = previewImageRef.current;
    
    if (ctx && img.complete) {
      // Apply filters and update preview
      applyCanvasFilters(canvas, ctx, img, config);
      
      // Update filtered image URL from canvas
      canvas.toBlob((blob) => {
        if (blob) {
          const newFilteredUrl = URL.createObjectURL(blob);
          setFilteredImageUrl(newFilteredUrl);
        }
      }, 'image/png');
    }
  };

  // Enhanced filter handlers
  const handleFilterChange = (key: keyof FilterConfig, value: number | boolean) => {
    const newConfig = { ...filterConfig, [key]: value };
    
    // Ensure only one artistic effect is active
    if (key === 'vintage' && value) {
      newConfig.sepia = false;
      newConfig.blackWhite = false;
    } else if (key === 'sepia' && value) {
      newConfig.vintage = false;
      newConfig.blackWhite = false;
    } else if (key === 'blackWhite' && value) {
      newConfig.vintage = false;
      newConfig.sepia = false;
    }
    
    setFilterConfig(newConfig);
    
    // Update preview in real-time
    setTimeout(() => updatePreview(newConfig), 50);
  };

  const handlePresetApply = (presetName: keyof typeof filterPresets) => {
    const presetConfig = applyPreset(presetName);
    setFilterConfig(presetConfig);
    
    // Update preview in real-time
    setTimeout(() => updatePreview(presetConfig), 50);
  };

  const handleResetFilters = () => {
    const resetConfig = resetFilters();
    setFilterConfig(resetConfig);
    
    // Update preview in real-time
    setTimeout(() => updatePreview(resetConfig), 50);
  };

  // Load image for preview
  useEffect(() => {
    if (originalImageUrl && previewImageRef.current) {
      const img = previewImageRef.current;
      img.onload = () => {
        // Initial preview with default filters
        updatePreview(filterConfig);
      };
      img.src = originalImageUrl;
    }
  }, [originalImageUrl]);

  // Update preview when filter config changes
  useEffect(() => {
    if (currentStep === 'configure' && originalImageUrl) {
      updatePreview(filterConfig);
    }
  }, [filterConfig, currentStep, originalImageUrl]);

  // Process filters
  const handleProcessFilters = async () => {
    if (!file) return;

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const startTime = Date.now();
      const result = await applyFilters(file, filterConfig);
      const processingTime = Date.now() - startTime;

      clearInterval(progressInterval);
      setProcessingProgress(100);

      // Create download URL
      const filteredBlob = new Blob([result.filteredImage], { type: 'image/png' });
      const downloadUrl = URL.createObjectURL(filteredBlob);

      const conversionResult: ConversionResult = {
        originalFile: file,
        filteredBlob,
        originalSize: file.size,
        filteredSize: filteredBlob.size,
        downloadUrl,
        appliedFilters: result.appliedFilters,
        processingTime
      };

      setFilterResult(conversionResult);
      setFilteredImageUrl(downloadUrl);

      // Upload to storage if user is authenticated
      if (user) {
        try {
          await uploadFile(file, 'image');
          
          // Track activity
          await ActivityTracker.createActivity(user.uid, {
            type: 'image_filter',
            fileName: file.name,
            originalFileName: file.name,
            fileSize: file.size,
            processedSize: filteredBlob.size,
            status: 'success',
            category: 'Image',
            processingTime,
            downloadUrl
          });
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }

      setTimeout(() => setCurrentStep('result'), 800);
    } catch (error) {
      console.error('Filter processing failed:', error);
      alert('Filtre işlemi sırasında hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!filterResult) return;

    const link = document.createElement('a');
    link.href = filterResult.downloadUrl;
    link.download = filterResult.originalFile.name.replace(/\.[^/.]+$/, '_filtered.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset handler
  const handleReset = () => {
    setCurrentStep('upload');
    setFile(null);
    setFilterConfig(defaultFilterConfig);
    setOriginalImageUrl('');
    setFilteredImageUrl('');
    setFilterResult(null);
    setShowComparison(false);
    setProcessingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-purple-300/20 rounded-full animate-pulse"
            style={{
              left: `${5 + (i * 3.8) % 95}%`,
              top: `${10 + (i * 6) % 80}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
      
      {/* SEO */}
      <StructuredData type="tool" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* STEP 1: UPLOAD */}
          <div ref={uploadRef} className={`py-16 transition-all duration-500 animate-fade-in ${
            currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="text-center mb-12">
              {/* AI Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4 text-purple-600 mr-2 animate-pulse" />
                {getText('imageFilters.badge', 'Professional Filters')} • AI Enhanced
              </div>
              
              {/* Enhanced Title */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  {getText('imageFilters.title', 'Professional')}
                </span>
                <br />
                <span className="text-gray-900">{getText('imageFilters.subtitle', 'Image Filters')}</span>
              </h1>
              
              <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8 leading-relaxed">
                {getText('imageFilters.description', 'Apply studio-quality filters to your images with real-time preview and comparison tools')}
              </p>
            </div>
            
            {/* Enhanced Upload Area */}
            <div className="max-w-2xl mx-auto">
              <div 
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 group ${
                  isDragActive 
                    ? 'border-purple-500 bg-purple-100/50 scale-105' 
                    : 'border-purple-300 hover:border-purple-400 bg-white/50 hover:bg-white/70'
                } backdrop-blur-sm shadow-2xl`}
              >
                <input {...getInputProps()} />
                
                {/* Orbital Rings */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-300/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-pink-300/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                </div>
                
                {/* Floating Sparkles */}
                <div className="absolute top-8 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-8 left-12 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                
                {/* Upload Icon */}
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <PhotoIcon className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isDragActive ? getText('imageFilters.upload.dropText', 'Drop your image here') : getText('imageFilters.upload.title', 'Upload Your Image')}
                  </h3>
                  <p className="text-gray-700 mb-8 text-lg">
                    {getText('imageFilters.upload.supportedFormats', 'Supports JPEG, PNG, WebP, GIF formats (max 10MB)')}
                  </p>
                  
                  <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-xl group-hover:shadow-2xl">
                    <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                    {getText('imageFilters.upload.chooseFile', 'Choose File')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* STEP 2: CONFIGURE */}
          {currentStep === 'configure' && file && (
            <div ref={configureRef} className="py-16 min-h-screen animate-fade-in">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-purple-600 mr-2" />
                  {getText('imageFilters.configure.step', 'Step 2: Configure Filters')}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {getText('imageFilters.configure.title', 'Filter Settings')}
                </h2>
              </div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview Section */}
                <div className="order-2 lg:order-1">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 sticky top-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <EyeIcon className="h-6 w-6 text-purple-600 mr-3" />
                      {getText('imageFilters.configure.preview', 'Preview')}
                    </h3>
                    
                    {/* Image Preview with Canvas - FIXED: aspect-square for better visibility */}
                    <div className="relative">
                      <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square relative">
                        {/* Hidden original image for canvas processing */}
                        <img 
                          ref={previewImageRef}
                          src={originalImageUrl} 
                          alt="Original"
                          className="hidden"
                          crossOrigin="anonymous"
                        />
                        
                        {/* Canvas for filtered preview */}
                        <canvas 
                          ref={previewCanvasRef}
                          className="w-full h-full object-cover"
                          style={{ display: filteredImageUrl ? 'block' : 'none' }}
                        />
                        
                        {/* Fallback image */}
                        {!filteredImageUrl && (
                          <img 
                            src={originalImageUrl} 
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Processing overlay */}
                        {isProcessing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Applying filters...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Comparison Toggle */}
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          {showComparison ? 'Single View' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="order-1 lg:order-2">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6 lg:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <PaintBrushIcon className="h-6 w-6 text-purple-600 mr-3" />
                      {getText('imageFilters.configure.adjustments', 'Adjustments')}
                    </h3>
                    
                    {/* Basic Adjustments */}
                    <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
                      {/* Brightness */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{getText('imageFilters.configure.brightness', 'Brightness')}</span>
                          <span className="text-purple-600">{Math.round(filterConfig.brightness * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={filterConfig.brightness}
                          onChange={(e) => handleFilterChange('brightness', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>

                      {/* Contrast */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{getText('imageFilters.configure.contrast', 'Contrast')}</span>
                          <span className="text-purple-600">{Math.round(filterConfig.contrast * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={filterConfig.contrast}
                          onChange={(e) => handleFilterChange('contrast', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>

                      {/* Saturation */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{getText('imageFilters.configure.saturation', 'Saturation')}</span>
                          <span className="text-purple-600">{Math.round(filterConfig.saturation * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={filterConfig.saturation}
                          onChange={(e) => handleFilterChange('saturation', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>

                      {/* Hue */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{getText('imageFilters.configure.hue', 'Hue')}</span>
                          <span className="text-purple-600">{filterConfig.hue}°</span>
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={filterConfig.hue}
                          onChange={(e) => handleFilterChange('hue', parseInt(e.target.value))}
                          className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Blur */}
                      <div>
                        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{getText('imageFilters.configure.blur', 'Blur')}</span>
                          <span className="text-purple-600">{filterConfig.blur}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={filterConfig.blur}
                          onChange={(e) => handleFilterChange('blur', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>

                    {/* Artistic Effects */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {getText('imageFilters.configure.artisticEffects', 'Artistic Effects')}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleFilterChange('vintage', !filterConfig.vintage)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            filterConfig.vintage
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getText('imageFilters.configure.vintage', 'Vintage')}
                        </button>
                        <button
                          onClick={() => handleFilterChange('sepia', !filterConfig.sepia)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            filterConfig.sepia
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getText('imageFilters.configure.sepia', 'Sepia')}
                        </button>
                        <button
                          onClick={() => handleFilterChange('blackWhite', !filterConfig.blackWhite)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            filterConfig.blackWhite
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getText('imageFilters.configure.blackWhite', 'Black & White')}
                        </button>
                      </div>
                    </div>

                    {/* Filter Presets */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {getText('imageFilters.configure.presets', 'Presets')}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handlePresetApply('vibrant')}
                          className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                        >
                          Vibrant
                        </button>
                        <button
                          onClick={() => handlePresetApply('soft')}
                          className="p-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200"
                        >
                          Soft
                        </button>
                        <button
                          onClick={() => handlePresetApply('vintage')}
                          className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-200"
                        >
                          Vintage
                        </button>
                        <button
                          onClick={() => handlePresetApply('sharp')}
                          className="p-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl text-sm font-medium hover:from-gray-800 hover:to-black transition-all duration-200"
                        >
                          Sharp
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons - FIXED: Better positioning and responsive */}
                    <div className="sticky bottom-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={handleResetFilters}
                          className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                        >
                          {getText('imageFilters.configure.reset', 'Reset')}
                        </button>
                        <button
                          onClick={handleProcessFilters}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                        >
                          {getText('imageFilters.configure.apply', 'Apply Filters')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 3: PROCESSING - RESPONSIVE OPTIMIZED */}
          {currentStep === 'processing' && (
            <div ref={processingRef} className="py-8 sm:py-12 lg:py-16 min-h-screen flex items-center justify-center animate-fade-in px-4">
              <div className="max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg backdrop-blur-sm">
                  <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mr-2 animate-spin" />
                  {getText('imageFilters.processing.step', 'Step 3: Applying Filters')}
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {getText('imageFilters.processing.title', 'AI Processing Your Image')}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-8 sm:mb-10 lg:mb-12 px-2">
                  {getText('imageFilters.processing.description', 'Applying studio-quality filters...')}
                </p>
                
                {/* Enhanced Loading Animation - RESPONSIVE */}
                <div className="relative mb-8 sm:mb-10 lg:mb-12">
                  {/* Orbital Rings - Responsive sizes */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto">
                    <div className="absolute inset-0 border-2 sm:border-3 lg:border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-1 sm:inset-2 border-2 sm:border-3 lg:border-4 border-pink-300 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                    <div className="absolute inset-2 sm:inset-3 lg:inset-4 border-2 sm:border-3 lg:border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    
                    {/* Center Icon - Responsive */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PaintBrushIcon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Floating Sparkles - SAFE mobile positioning */}
                  <div className="absolute top-0 left-4 sm:left-8 lg:-left-4 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-2 right-4 sm:right-8 lg:-right-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-0 left-2 sm:left-4 lg:-left-6 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute bottom-2 right-2 sm:right-4 lg:-right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Progress Bar - Responsive */}
                <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto bg-gray-200 rounded-full h-2 sm:h-3 mb-4 sm:mb-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 sm:h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2">
                  {getText('imageFilters.processing.progress', 'Processing Progress')}: {processingProgress}%
                </p>
              </div>
            </div>
          )}
          
          {/* STEP 4: RESULT */}
          {currentStep === 'result' && filterResult && (
            <div ref={resultRef} className="py-16 animate-fade-in">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  {getText('imageFilters.result.step', 'Step 4: Filters Applied!')}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {getText('imageFilters.result.title', 'Your Filtered Image is Ready')}
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                  {getText('imageFilters.result.description', 'Filters have been successfully applied. Download your new image below.')}
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                {/* Comparison View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Original Image */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      {getText('imageFilters.result.original', 'Original')}
                    </h3>
                    <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video">
                      <img 
                        src={originalImageUrl} 
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 text-center text-gray-600">
                      <p>{formatFileSize(filterResult.originalSize)}</p>
                    </div>
                  </div>

                  {/* Filtered Image */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      {getText('imageFilters.result.filtered', 'Filtered')}
                    </h3>
                    <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video">
                      <img 
                        src={filteredImageUrl} 
                        alt="Filtered"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 text-center text-gray-600">
                      <p>{formatFileSize(filterResult.filteredSize)}</p>
                    </div>
                  </div>
                </div>

                {/* Filter Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {getText('imageFilters.result.appliedFilters', 'Applied Filters')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {filterResult.appliedFilters.length}
                      </div>
                      <div className="text-gray-600">Filters Applied</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-pink-600 mb-2">
                        {filterResult.processingTime}ms
                      </div>
                      <div className="text-gray-600">
                        {getText('imageFilters.result.processingTime', 'Processing Time')}
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        100%
                      </div>
                      <div className="text-gray-600">Quality Preserved</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-xl"
                  >
                    <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
                    {getText('imageFilters.result.downloadFiltered', 'Download Filtered Image')}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center px-8 py-4 bg-white/70 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-300 font-semibold text-lg backdrop-blur-sm"
                  >
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    {getText('imageFilters.result.newFilter', 'New Filter')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Image Tools */}
          <div className="py-16 bg-white/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Discover Other Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                  href={`/${locale}/image-compress`}
                  className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <ArrowPathIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Image Compress</h4>
                  <p className="text-sm text-gray-600">Reduce file size with AI</p>
                </Link>

                <Link
                  href={`/${locale}/image-resize`}
                  className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <RectangleGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Image Resize</h4>
                  <p className="text-sm text-gray-600">Resize to any dimension</p>
                </Link>

                <Link
                  href={`/${locale}/image-crop`}
                  className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <SwatchIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Image Crop</h4>
                  <p className="text-sm text-gray-600">Smart cropping with AI</p>
                </Link>

                <Link
                  href={`/${locale}/image-format-convert`}
                  className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <DocumentIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Format Convert</h4>
                  <p className="text-sm text-gray-600">Convert between formats</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 