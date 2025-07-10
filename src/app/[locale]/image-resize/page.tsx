'use client';
import { useState, useRef, useEffect } from 'react';
import { PhotoIcon, SparklesIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { ActivityTracker } from '@/lib/activityTracker';
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
  height 
}: {
  imageUrl: string;
  originalDimensions: { width: number; height: number };
  width: number | undefined;
  height: number | undefined;
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
              ? 'Orijinal Boyut' 
              : previewWidth < originalDimensions.width || previewHeight < originalDimensions.height
              ? 'Küçültülüyor'
              : 'Büyütülüyor'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageResize() {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Refs for smooth scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);
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
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
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
      processButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

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

      // Simulate progress steps
      const progressSteps = [
        { progress: 20, message: 'Preparing image...' },
        { progress: 50, message: 'Calculating dimensions...' },
        { progress: 80, message: 'Resizing image...' },
        { progress: 100, message: 'Finalizing...' }
      ];

      for (const step of progressSteps) {
        setProcessingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
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
      }, 100);

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
      <Breadcrumb />

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
                  Image Resize
                </h1>
                <p className="text-sm text-gray-600">Step {
                  currentStep === 'upload' ? '1' : 
                  currentStep === 'configure' ? '2' : 
                  currentStep === 'processing' ? '3' : '4'
                } of 4</p>
              </div>
            </div>
            
            {currentStep !== 'upload' && (
              <button
                onClick={resetToStart}
                className="flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/70 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>New Image</span>
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
              5M+ Resim Boyutlandırıldı • AI Destekli
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                📐 Image Resize
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Resize your images to any dimension with precision and quality
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
                  {isDragActive ? 'Drop your image here' : 'Select Image to Resize'}
                </h3>
                <p className="text-gray-600 mb-6">
                  PNG, JPEG, WebP, GIF • Up to 50MB
                </p>
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 inline-block">
                  Choose File
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-700">Secure Processing</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-700">Lightning Fast</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm font-medium text-gray-700">Pixel Perfect</p>
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
                    Configure Resize Settings
                  </h2>
                  <p className="text-gray-600">Set your desired dimensions and options</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left: Interactive Preview (3/5) */}
                  <div className="lg:col-span-3">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">Live Preview</h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        🎯 Adjust dimensions using controls on the right and see live preview
                      </p>
                      <SimplePreviewBox
                        imageUrl={URL.createObjectURL(file)}
                        originalDimensions={originalDimensions}
                        width={width}
                        height={height}
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
                        <label className="block text-sm font-medium text-gray-700 mb-3">Resize Mode</label>
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setResizeMode('pixels')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'pixels'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            By Pixels
                          </button>
                          <button
                            onClick={() => setResizeMode('percentage')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                              resizeMode === 'percentage'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            By Percentage
                          </button>
                        </div>
                      </div>

                      {/* Resize Controls */}
                      {resizeMode === 'pixels' ? (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Width (px)
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
                              placeholder="Enter width..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Height (px)
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
                              placeholder="Enter height..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resize to % of original
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
                            placeholder="Enter percentage..."
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            Result: {Math.round(originalDimensions.width * (percentageValue / 100))}×{Math.round(originalDimensions.height * (percentageValue / 100))}
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
                          <span className="text-sm text-gray-700">Maintain aspect ratio</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={doNotEnlarge}
                            onChange={(e) => setDoNotEnlarge(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">Do not enlarge if smaller</span>
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
                        <span>🚀 Start Resizing</span>
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
          <div className="py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12">
                
                {/* Multiple rotating rings */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                    <div className="absolute inset-2 border-4 border-pink-300 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-4 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                    <div className="absolute inset-6 border-4 border-pink-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  🤖 AI Resizing Your Image
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Please wait while we process your image with precision...
                </p>
                
                {/* Progress bar with shimmer */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${processingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">{processingProgress}% Complete</p>
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
                      ✅ Resize Complete!
                    </h2>
                    <p className="text-gray-600">Your image has been resized successfully</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Before */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-4">Original</h3>
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
                      <h3 className="font-semibold text-gray-900 mb-4">Resized</h3>
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
                      <span>📥 Download Resized Image</span>
                    </button>
                    
                    <button
                      onClick={resetToStart}
                      className="text-gray-600 hover:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Resize Another Image
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