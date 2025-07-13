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

  // Auto-focus on upload area when page loads
  useEffect(() => {
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFile(file);
      
      try {
        const dimensions = await getImageDimensions(file);
        setOriginalDimensions(dimensions);
        
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        setCurrentStep('configure');
        
        // Fixed: Single scroll to configure section with center positioning
        setTimeout(() => {
          configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          configureRef.current?.focus();
        }, 300);
      } catch (error) {
        console.error('Error getting image dimensions:', error);
      }
    },
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
    },
    multiple: false
  });

  // Handle rotation
  const handleRotate = async () => {
    if (!file || rotation === 0) return;

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    // Scroll to processing section with better focus
    setTimeout(() => {
      processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      processingRef.current?.focus();
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
      console.error('Image rotation error:', error);
      setCurrentStep('configure');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset function
  const resetProcess = () => {
    setCurrentStep('upload');
    setFile(null);
    setRotation(0);
    setRotateResult(null);
    setOriginalDimensions(null);
    setProcessingProgress(0);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Scroll back to upload
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Multi-language text variables (TR, FR, ES, EN)
  const badgeText = getText('imageRotate.badge', '500K+ Resim Döndürüldü • AI Destekli');
  const titleText = getText('imageRotate.title', '🔄 Resim Döndürme');
  const descriptionText = getText('imageRotate.description', 'Resimlerinizi istediğiniz açıda kolayca döndürün. Güçlü işleme teknolojimizle kalite kaybı olmadan döndürme yapın.');
  const trustNoQualityLoss = getText('imageRotate.trust.noQualityLoss', 'Kalite Kaybı Yok');
  const trustAllFormats = getText('imageRotate.trust.allFormats', 'Tüm Formatlar');
  const trustSecureFast = getText('imageRotate.trust.secureFast', 'Güvenli & Hızlı');

  // Step 1 - Upload
  const uploadTitle = getText('imageRotate.upload.title', 'Resim Yükleyin');
  const uploadDescription = getText('imageRotate.upload.description', 'JPEG, PNG, WebP formatlarında resimlerinizi yükleyin');
  const dropText = getText('imageRotate.upload.dropText', 'Dosyayı Bırakın');
  const uploadText = getText('imageRotate.upload.uploadText', 'Resim Yükleyin');
  const dragOrSelect = getText('imageRotate.upload.dragOrSelect', 'Dosyayı sürükleyip bırakın veya seçin');
  const selectFile = getText('imageRotate.upload.selectFile', 'Dosya Seçin');
  const fileTypes = getText('imageRotate.upload.fileTypes', 'JPEG, PNG, WebP • Max 50MB');

  // Step 2 - Configure
  const previewTitle = getText('imageRotate.configure.previewTitle', 'Önizleme');
  const settingsTitle = getText('imageRotate.configure.settingsTitle', 'Döndürme Ayarları');
  const backButton = getText('imageRotate.configure.backButton', 'Geri');
  const quickRotationTitle = getText('imageRotate.configure.quickRotationTitle', 'Hızlı Döndürme');
  const rotate90Right = getText('imageRotate.configure.rotate90Right', '90° Sağa');
  const rotate180 = getText('imageRotate.configure.rotate180', '180° Ters');
  const rotate90Left = getText('imageRotate.configure.rotate90Left', '90° Sola');
  const resetAngle = getText('imageRotate.configure.resetAngle', 'Sıfırla');
  const customAngleTitle = getText('imageRotate.configure.customAngleTitle', 'Özel Açı');
  const currentAngle = getText('imageRotate.configure.currentAngle', 'Döndürme Açısı:');
  const anglePlaceholder = getText('imageRotate.configure.anglePlaceholder', 'Açı (0-360°)');
  const startRotation = getText('imageRotate.configure.startRotation', '🚀 Döndürmeyi Başlat');

  // Step 3 - Processing
  const processingTitle = getText('imageRotate.processing.title', 'Resim Döndürülüyor...');
  const processingDescription = getText('imageRotate.processing.description', 'AI destekli teknolojimizle resminiz kalite kaybı olmadan döndürülüyor');
  const completed = getText('imageRotate.processing.completed', 'tamamlandı');
  const stepAnalysis = getText('imageRotate.processing.stepAnalysis', 'Resim Analizi');
  const stepRotating = getText('imageRotate.processing.stepRotating', 'Döndürülüyor');
  const stepOptimizing = getText('imageRotate.processing.stepOptimizing', 'Optimize Ediliyor');

  // Step 4 - Result
  const successTitle = getText('imageRotate.result.successTitle', 'Döndürme Tamamlandı');
  const successSubtitle = getText('imageRotate.result.successSubtitle', 'Resminiz Başarıyla Döndürüldü!');
  const beforeTitle = getText('imageRotate.result.beforeTitle', 'Öncesi');
  const afterTitle = getText('imageRotate.result.afterTitle', 'Sonrası');
  const rotatedImageTitle = getText('imageRotate.result.rotatedImageTitle', 'Döndürülmüş Resim');
  const rotatedAngle = getText('imageRotate.result.rotatedAngle', 'döndürüldü');
  const downloadButton = getText('imageRotate.result.downloadButton', 'Döndürülmüş Resmi İndir');
  const newImageButton = getText('imageRotate.result.newImageButton', 'Yeni Resim Döndür');

  // Enhanced debug logging after all variables are defined
  console.log('🐛 DEBUG - Image Rotate Locale:', locale);
  console.log('🐛 DEBUG - Current step:', currentStep);
  console.log('🐛 DEBUG - Badge text:', badgeText);
  console.log('🐛 DEBUG - Title text:', titleText);
  console.log('🐛 DEBUG - Description text:', descriptionText);
  console.log('🐛 DEBUG - Upload title:', uploadTitle);
  console.log('🐛 DEBUG - Processing title:', processingTitle);
  console.log('🐛 DEBUG - Success title:', successTitle);
  console.log('🐛 DEBUG - Download button:', downloadButton);

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
                    {getText('imageRotate.result.completionMessage', `${rotateResult.rotationAngle}° döndürme işlemi kalite kaybı olmadan tamamlandı`)}
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