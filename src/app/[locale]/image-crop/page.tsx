'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparklesIcon, PhotoIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
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
  cropImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult 
} from '@/lib/imageUtils';

// Types
interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropResult {
  originalFile: File;
  croppedBlob: Blob;
  originalSize: number;
  croppedSize: number;
  cropDimensions: { width: number; height: number };
  downloadUrl: string;
}

// Interactive Crop Box Component with Enhanced Sync
function InteractiveCropBox({ 
  imageUrl, 
  originalDimensions, 
  cropOptions,
  onCropChange 
}: {
  imageUrl: string;
  originalDimensions: { width: number; height: number };
  cropOptions: CropOptions;
  onCropChange: (crop: CropOptions) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ 
    x: number; 
    y: number; 
    crop: CropOptions;
    containerRect: DOMRect;
    imageRect: DOMRect;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const calculateCropFromMouse = useCallback((clientX: number, clientY: number, handle: string): CropOptions => {
    if (!dragStart) return cropOptions;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    // Calculate scale factor between displayed image and original dimensions
    const scaleX = originalDimensions.width / dragStart.imageRect.width;
    const scaleY = originalDimensions.height / dragStart.imageRect.height;
    
    const scaledDeltaX = deltaX * scaleX;
    const scaledDeltaY = deltaY * scaleY;
    
    let { x, y, width, height } = dragStart.crop;

    switch (handle) {
      case 'nw': // top-left
        x = Math.max(0, Math.min(x + scaledDeltaX, x + width - 10));
        y = Math.max(0, Math.min(y + scaledDeltaY, y + height - 10));
        width = dragStart.crop.x + dragStart.crop.width - x;
        height = dragStart.crop.y + dragStart.crop.height - y;
        break;
      case 'ne': // top-right
        y = Math.max(0, Math.min(y + scaledDeltaY, y + height - 10));
        width = Math.max(10, Math.min(width + scaledDeltaX, originalDimensions.width - x));
        height = dragStart.crop.y + dragStart.crop.height - y;
        break;
      case 'sw': // bottom-left
        x = Math.max(0, Math.min(x + scaledDeltaX, x + width - 10));
        width = dragStart.crop.x + dragStart.crop.width - x;
        height = Math.max(10, Math.min(height + scaledDeltaY, originalDimensions.height - y));
        break;
      case 'se': // bottom-right
        width = Math.max(10, Math.min(width + scaledDeltaX, originalDimensions.width - x));
        height = Math.max(10, Math.min(height + scaledDeltaY, originalDimensions.height - y));
        break;
      case 'n': // top edge
        y = Math.max(0, Math.min(y + scaledDeltaY, y + height - 10));
        height = dragStart.crop.y + dragStart.crop.height - y;
        break;
      case 's': // bottom edge
        height = Math.max(10, Math.min(height + scaledDeltaY, originalDimensions.height - y));
        break;
      case 'w': // left edge
        x = Math.max(0, Math.min(x + scaledDeltaX, x + width - 10));
        width = dragStart.crop.x + dragStart.crop.width - x;
        break;
      case 'e': // right edge
        width = Math.max(10, Math.min(width + scaledDeltaX, originalDimensions.width - x));
        break;
      case 'move': // move entire crop area
        x = Math.max(0, Math.min(x + scaledDeltaX, originalDimensions.width - width));
        y = Math.max(0, Math.min(y + scaledDeltaY, originalDimensions.height - height));
        break;
    }

    return { 
      x: Math.round(x), 
      y: Math.round(y), 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }, [dragStart, cropOptions, originalDimensions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle || !dragStart) return;
    
    const newCrop = calculateCropFromMouse(e.clientX, e.clientY, dragHandle);
    onCropChange(newCrop);
  }, [isDragging, dragHandle, dragStart, calculateCropFromMouse, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
    setDragStart(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...cropOptions },
      containerRect,
      imageRect
    });
  }, [cropOptions]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate crop overlay position and size as percentages
  const cropLeft = (cropOptions.x / originalDimensions.width) * 100;
  const cropTop = (cropOptions.y / originalDimensions.height) * 100;
  const cropWidth = (cropOptions.width / originalDimensions.width) * 100;
  const cropHeight = (cropOptions.height / originalDimensions.height) * 100;

  const handles = [
    { id: 'nw', className: 'nw-resize', style: { top: '-6px', left: '-6px' } },
    { id: 'ne', className: 'ne-resize', style: { top: '-6px', right: '-6px' } },
    { id: 'sw', className: 'sw-resize', style: { bottom: '-6px', left: '-6px' } },
    { id: 'se', className: 'se-resize', style: { bottom: '-6px', right: '-6px' } },
    { id: 'n', className: 'n-resize', style: { top: '-6px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 's', className: 's-resize', style: { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'w', className: 'w-resize', style: { left: '-6px', top: '50%', transform: 'translateY(-50%)' } },
    { id: 'e', className: 'e-resize', style: { right: '-6px', top: '50%', transform: 'translateY(-50%)' } },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[450px] flex items-center justify-center"
      onMouseUp={handleMouseUp}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Interactive Crop Preview"
        className="max-w-full max-h-[450px] object-contain"
        draggable={false}
        style={{ userSelect: 'none' }}
      />
      
      {/* Crop Overlay */}
      <div 
        className="absolute pointer-events-none"
        style={{
          left: `${cropLeft}%`,
          top: `${cropTop}%`,
          width: `${cropWidth}%`,
          height: `${cropHeight}%`,
        }}
      >
        {/* Crop area border */}
        <div className="absolute inset-0 border-2 border-purple-500 bg-purple-500/10 pointer-events-auto">
          
          {/* Moveable area (center) */}
          <div 
            className="absolute inset-2 cursor-move bg-transparent"
            onMouseDown={(e) => handleMouseDown(e, 'move')}
          />

          {/* Resize handles */}
          {handles.map((handle) => (
            <div
              key={handle.id}
              className={`absolute w-3 h-3 bg-purple-500 border-2 border-white rounded-sm cursor-${handle.className} pointer-events-auto hover:bg-purple-600 transition-colors`}
              style={handle.style}
              onMouseDown={(e) => handleMouseDown(e, handle.id)}
            />
          ))}
        </div>
      </div>

      {/* Dark overlay for non-cropped areas */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top overlay */}
        <div 
          className="absolute top-0 left-0 right-0 bg-black/50"
          style={{ height: `${cropTop}%` }}
        />
        {/* Bottom overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-black/50"
          style={{ height: `${100 - cropTop - cropHeight}%` }}
        />
        {/* Left overlay */}
        <div 
          className="absolute left-0 bg-black/50"
          style={{ 
            top: `${cropTop}%`, 
            height: `${cropHeight}%`,
            width: `${cropLeft}%`
          }}
        />
        {/* Right overlay */}
        <div 
          className="absolute right-0 bg-black/50"
          style={{ 
            top: `${cropTop}%`, 
            height: `${cropHeight}%`,
            width: `${100 - cropLeft - cropWidth}%`
          }}
        />
      </div>

      {/* Crop info */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <p className="font-medium">
          Crop Area: {cropOptions.width} × {cropOptions.height}
        </p>
        <p className="text-xs opacity-80">
          Position: ({cropOptions.x}, {cropOptions.y})
        </p>
      </div>
    </div>
  );
}

export default function ImageCrop({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  const translations = getTranslations(locale);
  
  // getText function for translations
  const getText = (key: string, fallback: string) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || fallback;
  };

  // Dynamic fallbacks based on locale
  const getFallbackText = (trText: string, enText: string): string => {
    switch (locale) {
      case 'tr': return trText;
      case 'en': return enText;
      case 'es': return enText; // Spanish fallback to English
      case 'fr': return enText; // French fallback to English  
      case 'de': return enText; // German fallback to English
      case 'ar': return enText; // Arabic fallback to English
      case 'ja': return enText; // Japanese fallback to English
      case 'ko': return enText; // Korean fallback to English
      default: return enText;
    }
  };

  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Refs for smooth scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Component state - Step-based like PDF convert
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropOptions, setCropOptions] = useState<CropOptions>({ x: 0, y: 0, width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);

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
    setPreviewUrl(URL.createObjectURL(selectedFile));
    
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      
      // Set default crop to center 80% of image
      const defaultCrop = {
        x: Math.round(dimensions.width * 0.1),
        y: Math.round(dimensions.height * 0.1),
        width: Math.round(dimensions.width * 0.8),
        height: Math.round(dimensions.height * 0.8)
      };
      setCropOptions(defaultCrop);
      setCurrentStep('configure');
      
      // Scroll to configure section
      setTimeout(() => {
        configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }
  };

  // Preset crop functions
  const applyPresetCrop = (preset: 'square' | 'center' | 'wide' | 'tall') => {
    if (!originalDimensions) return;
    
    const { width: imgWidth, height: imgHeight } = originalDimensions;
    let newCrop: CropOptions;
    
    switch (preset) {
      case 'square':
        const size = Math.min(imgWidth, imgHeight) * 0.9;
        newCrop = {
          x: Math.round((imgWidth - size) / 2),
          y: Math.round((imgHeight - size) / 2),
          width: Math.round(size),
          height: Math.round(size)
        };
        break;
      case 'center':
        newCrop = {
          x: Math.round(imgWidth * 0.15),
          y: Math.round(imgHeight * 0.15),
          width: Math.round(imgWidth * 0.7),
          height: Math.round(imgHeight * 0.7)
        };
        break;
      case 'wide':
        newCrop = {
          x: 0,
          y: Math.round(imgHeight * 0.2),
          width: imgWidth,
          height: Math.round(imgHeight * 0.6)
        };
        break;
      case 'tall':
        newCrop = {
          x: Math.round(imgWidth * 0.2),
          y: 0,
          width: Math.round(imgWidth * 0.6),
          height: imgHeight
        };
        break;
    }
    
    setCropOptions(newCrop);
  };

  // Start crop process
  const startCrop = async () => {
    if (!file || !cropOptions.width || !cropOptions.height) return;

    // Note: Image crop is a free feature, no authentication required

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    // Scroll to processing section
    setTimeout(() => {
      processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      processingRef.current?.focus();
    }, 300);

    try {
      // Simulate progress steps with longer delays for better visibility
      const progressSteps = [
        { progress: 15, message: 'Analyzing crop area...', delay: 800 },
        { progress: 35, message: 'Preparing crop...', delay: 1000 },
        { progress: 60, message: 'Calculating dimensions...', delay: 1200 },
        { progress: 85, message: 'Cropping image...', delay: 1000 },
        { progress: 100, message: 'Finalizing...', delay: 800 }
      ];

      for (const step of progressSteps) {
        setProcessingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // Perform actual crop
      const result = await cropImage(file, cropOptions);
      
      // Create crop result
      const cropData: CropResult = {
        originalFile: file,
        croppedBlob: result.file,
        originalSize: file.size,
        croppedSize: result.file.size,
        cropDimensions: { width: cropOptions.width, height: cropOptions.height },
        downloadUrl: URL.createObjectURL(result.file)
      };

      setCropResult(cropData);
      setCurrentStep('result');

      // Scroll to result section
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

      // Track activity only if user is logged in
      if (user) {
        await ActivityTracker.createActivity(user.uid, {
          type: 'image_crop',
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
      console.error('Crop error:', error);
      setCurrentStep('configure');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to start
  const resetToStart = () => {
    setCurrentStep('upload');
    setFile(null);
    setPreviewUrl('');
    setCropResult(null);
    setOriginalDimensions(null);
    setCropOptions({ x: 0, y: 0, width: 0, height: 0 });
    
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Download cropped image
  const downloadCroppedImage = () => {
    if (cropResult) {
      const link = document.createElement('a');
      link.href = cropResult.downloadUrl;
      link.download = `cropped_${cropResult.originalFile.name}`;
      link.click();
    }
  };

  // Multi-language support via getText system
  
  // Header texts
  const headerTitle = getText('imageCrop.title', getFallbackText('Resim Kırpma', 'Image Crop'));
  const stepText = getText('imageCrop.step', getFallbackText('Adım', 'Step'));
  const ofText = getText('imageCrop.stepOf', '/ 4');
  const stepNumber = currentStep === 'upload' ? '1' : currentStep === 'configure' ? '2' : currentStep === 'processing' ? '3' : '4';
  const newImageText = getText('imageCrop.newImage', getFallbackText('Yeni Resim', 'New Image'));
  
  // Upload step
  const statsText = getText('imageCrop.badge', getFallbackText('3M+ Resim Kırpıldı • Yapay Zeka Destekli', '3M+ Images Cropped • AI-Powered'));
  const mainTitle = getText('imageCrop.mainTitle', getFallbackText('✂️ Resim Kırpma', '✂️ Image Crop'));
  const description = getText('imageCrop.description', getFallbackText('Resimlerinizi mükemmel boyutta kırpın ve en önemli alanlara odaklanın', 'Crop your images to the perfect size and focus on the most important areas'));
  const uploadTitle = isDragActive 
    ? getText('imageCrop.upload.dropImage', getFallbackText('Resminizi buraya bırakın', 'Drop your image here'))
    : getText('imageCrop.upload.selectImage', getFallbackText('Kırpılacak Resmi Seçin', 'Select Image to Crop'));
  const formatText = getText('imageCrop.upload.supportedFormats', getFallbackText('PNG, JPEG, WebP, GIF • 50MB\'a kadar', 'PNG, JPEG, WebP, GIF • Up to 50MB'));
  const chooseFileText = getText('imageCrop.upload.chooseFile', getFallbackText('Dosya Seç', 'Choose File'));
  const secureText = getText('imageCrop.upload.secure', getFallbackText('Güvenli İşleme', 'Secure Processing'));
  const fastText = getText('imageCrop.upload.fast', getFallbackText('Hızlı İşlem', 'Fast Processing'));
  const preciseText = getText('imageCrop.upload.precise', getFallbackText('Hassas Kırpma', 'Precise Cropping'));
  
  // Configure step
  const configureTitle = getText('imageCrop.configure.title', getFallbackText('Kırpma Alanını Yapılandır', 'Configure Crop Area'));
  const configureDesc = getText('imageCrop.configure.description', getFallbackText('Saklamak istediğiniz alanı seçin', 'Select the area you want to keep'));
  const previewTitle = getText('imageCrop.configure.previewTitle', getFallbackText('İnteraktif Kırpma Önizlemesi', 'Interactive Crop Preview'));
  const previewInstructions = getText('imageCrop.configure.previewInstructions', getFallbackText('🎯 Kırpma alanını ayarlamak için tutamaçları sürükleyin veya taşımak için merkeze tıklayın', '🎯 Drag the handles to adjust the crop area or click the center to move it'));
  const presetsText = getText('imageCrop.configure.presets', getFallbackText('Hızlı Hazır Ayarlar', 'Quick Presets'));
  const squareText = getText('imageCrop.configure.presetSquare', getFallbackText('🔲 Kare', '🔲 Square'));
  const centerText = getText('imageCrop.configure.presetCenter', getFallbackText('🎯 Merkez', '🎯 Center'));
  const wideText = getText('imageCrop.configure.presetWide', getFallbackText('📐 Geniş', '📐 Wide'));
  const tallText = getText('imageCrop.configure.presetTall', getFallbackText('📏 Uzun', '📏 Tall'));
  const dimensionsText = getText('imageCrop.configure.dimensions', getFallbackText('Kırpma Boyutları', 'Crop Dimensions'));
  const xPosText = getText('imageCrop.configure.xPosition', getFallbackText('X Konumu', 'X Position'));
  const yPosText = getText('imageCrop.configure.yPosition', getFallbackText('Y Konumu', 'Y Position'));
  const widthText = getText('imageCrop.configure.width', getFallbackText('Genişlik', 'Width'));
  const heightText = getText('imageCrop.configure.height', getFallbackText('Yükseklik', 'Height'));
  const xPlaceholder = getText('imageCrop.configure.xPlaceholder', getFallbackText('X girin...', 'Enter X...'));
  const yPlaceholder = getText('imageCrop.configure.yPlaceholder', getFallbackText('Y girin...', 'Enter Y...'));
  const widthPlaceholder = getText('imageCrop.configure.widthPlaceholder', getFallbackText('Genişlik girin...', 'Enter width...'));
  const heightPlaceholder = getText('imageCrop.configure.heightPlaceholder', getFallbackText('Yükseklik girin...', 'Enter height...'));
  const startText = getText('imageCrop.configure.startCropping', getFallbackText('✂️ Kırpmayı Başlat', '✂️ Start Cropping'));
  
  // Processing step
  const processingTitle = getText('imageCrop.processing.title', getFallbackText('✂️ Yapay Zeka Resminizi Kırpıyor', '✂️ AI is Cropping Your Image'));
  const processingDesc = getText('imageCrop.processing.description', getFallbackText('Resminizi hassas bir şekilde kırparken lütfen bekleyin...', 'Please wait while we precisely crop your image...'));
  const completeText = getText('imageCrop.processing.complete', getFallbackText('Tamamlandı', 'Complete'));
  
  // Result step
  const resultTitle = getText('imageCrop.result.title', getFallbackText('✂️ Kırpma Tamamlandı!', '✂️ Cropping Complete!'));
  const resultDescText = getText('imageCrop.result.description', getFallbackText('Resminiz başarıyla kırpıldı', 'Your image has been successfully cropped'));
  const originalText = getText('imageCrop.result.original', getFallbackText('Orijinal', 'Original'));
  const croppedText = getText('imageCrop.result.cropped', getFallbackText('Kırpılmış', 'Cropped'));
  const downloadText = getText('imageCrop.result.downloadButton', getFallbackText('✂️ Kırpılmış Resmi İndir', '✂️ Download Cropped Image'));
  const anotherText = getText('imageCrop.result.newCrop', getFallbackText('Başka Bir Resim Kırp', 'Crop Another Image'));

  // Enhanced debug logging with browser detection
  useEffect(() => {
    console.log('✂️ IMAGE CROP DEBUG - Locale Detection:', {
      currentLocale: locale,
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
      browserLanguages: navigator.languages,
      timestamp: new Date().toISOString()
    });
  }, [locale]);

  // Enhanced translation debugging
  useEffect(() => {
    console.log('✂️ IMAGE CROP DEBUG - Translation Values:', {
      headerTitle,
      mainTitle,
      configureTitle,
      processingTitle,
      resultTitle,
      downloadText,
      currentStep,
      timestamp: new Date().toISOString()
    });
  }, [headerTitle, mainTitle, configureTitle, processingTitle, resultTitle, downloadText, currentStep]);

  // Browser language auto-detection system
  useEffect(() => {
    const detectAndRedirectLanguage = () => {
      if (typeof window === 'undefined') return;

      const currentPath = window.location.pathname;
      const supportedLanguages = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
      
      // Check if URL already has locale
      const hasLocaleInPath = supportedLanguages.some(lang => currentPath.startsWith(`/${lang}/`));
      
      if (!hasLocaleInPath) {
        // Get browser language preference
        const browserLang = navigator.language?.split('-')[0];
        const preferredLang = localStorage.getItem('quickutil_preferred_locale');
        
        console.log('🌍 IMAGE CROP DEBUG - Browser Language Auto-Detection:', {
          browserLanguage: navigator.language,
          detectedLang: browserLang,
          preferredLang,
          supportedLanguages,
          currentPath,
          timestamp: new Date().toISOString()
        });
        
        // Determine target language
        let targetLang = 'tr'; // default
        if (preferredLang && supportedLanguages.includes(preferredLang)) {
          targetLang = preferredLang;
        } else if (browserLang && supportedLanguages.includes(browserLang)) {
          targetLang = browserLang;
          localStorage.setItem('quickutil_preferred_locale', targetLang);
        }
        
        // Redirect to proper language URL
        if (targetLang !== 'tr' || !currentPath.startsWith('/image-crop')) {
          const newPath = targetLang === 'tr' ? '/image-crop' : `/${targetLang}/image-crop`;
          console.log('🌍 REDIRECTING to:', newPath);
          window.location.href = newPath;
          return;
        }
      }
    };

    // Run detection after component mount
    const timer = setTimeout(detectAndRedirectLanguage, 100);
    return () => clearTimeout(timer);
  }, []);

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

            {/* Trust indicators */}
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
                <div className="text-2xl mb-2">✂️</div>
                <p className="text-sm font-medium text-gray-700">{preciseText}</p>
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

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left: Interactive Preview (2/3) */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">{previewTitle}</h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        {previewInstructions}
                      </p>
                      <InteractiveCropBox
                        imageUrl={previewUrl}
                        originalDimensions={originalDimensions}
                        cropOptions={cropOptions}
                        onCropChange={setCropOptions}
                      />
                      <div className="mt-4 text-sm text-gray-600 text-center">
                        <p className="font-medium">{file.name}</p>
                        <p>{formatFileSize(file.size)} • {originalDimensions.width}×{originalDimensions.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Settings (1/3) */}
                  <div className="lg:col-span-1">
                    <div className="space-y-6">
                      
                      {/* Preset Crops */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{presetsText}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => applyPresetCrop('square')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium text-gray-700"
                          >
                            {squareText}
                          </button>
                          <button
                            onClick={() => applyPresetCrop('center')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium text-gray-700"
                          >
                            {centerText}
                          </button>
                          <button
                            onClick={() => applyPresetCrop('wide')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium text-gray-700"
                          >
                            {wideText}
                          </button>
                          <button
                            onClick={() => applyPresetCrop('tall')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium text-gray-700"
                          >
                            {tallText}
                          </button>
                        </div>
                      </div>

                      {/* Crop Dimensions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{dimensionsText}</label>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-700 font-medium mb-1">{xPosText}</label>
                              <input
                                type="number"
                                value={cropOptions.x}
                                onChange={(e) => setCropOptions(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                                placeholder={xPlaceholder}
                                min="0"
                                max={originalDimensions.width}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 font-medium mb-1">{yPosText}</label>
                              <input
                                type="number"
                                value={cropOptions.y}
                                onChange={(e) => setCropOptions(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                                placeholder={yPlaceholder}
                                min="0"
                                max={originalDimensions.height}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-700 font-medium mb-1">{widthText}</label>
                              <input
                                type="number"
                                value={cropOptions.width}
                                onChange={(e) => setCropOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                                placeholder={widthPlaceholder}
                                min="1"
                                max={originalDimensions.width}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 font-medium mb-1">{heightText}</label>
                              <input
                                type="number"
                                value={cropOptions.height}
                                onChange={(e) => setCropOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                                placeholder={heightPlaceholder}
                                min="1"
                                max={originalDimensions.height}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Start Button */}
                      <button
                        ref={processButtonRef}
                        onClick={startCrop}
                        disabled={!cropOptions.width || !cropOptions.height}
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
                  
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    {processingTitle}
                  </h3>
                  
                  <p className="text-xl text-gray-700 mb-8 font-medium">
                    {processingDesc}
                  </p>
                  
                  {/* Progress bar with shimmer - larger */}
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                    <div 
                      className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative shadow-lg"
                      style={{ width: `${processingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-purple-600 font-semibold">{processingProgress}% {completeText}</p>
                  
                  {/* Processing status */}
                  <div className="mt-8 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-purple-700 font-medium">
                        {processingProgress < 15 ? 
                          getText('imageCrop.processing.step1', 'Kırpma alanı analiz ediliyor...') :
                         processingProgress < 35 ? 
                          getText('imageCrop.processing.step2', 'Kırpma hazırlanıyor...') :
                         processingProgress < 60 ? 
                          getText('imageCrop.processing.step3', 'Boyutlar hesaplanıyor...') :
                         processingProgress < 85 ? 
                          getText('imageCrop.processing.step4', 'Resim kırpılıyor...') : 
                          getText('imageCrop.processing.step5', 'Tamamlanıyor...')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT */}
        {currentStep === 'result' && cropResult && (
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
                          src={previewUrl}
                          alt="Original"
                          className="max-w-full max-h-48 object-contain mx-auto rounded-lg"
                        />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{formatFileSize(cropResult.originalSize)}</p>
                        <p>{originalDimensions?.width}×{originalDimensions?.height}</p>
                      </div>
                    </div>

                    {/* After */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-4">{croppedText}</h3>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border-2 border-purple-200">
                        <img
                          src={cropResult.downloadUrl}
                          alt="Cropped"
                          className="max-w-full max-h-48 object-contain mx-auto rounded-lg"
                        />
                      </div>
                      <div className="space-y-1 text-sm text-green-600 font-medium">
                        <p>{formatFileSize(cropResult.croppedSize)}</p>
                        <p>{cropResult.cropDimensions.width}×{cropResult.cropDimensions.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="text-center space-y-4">
                    <button
                      onClick={downloadCroppedImage}
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