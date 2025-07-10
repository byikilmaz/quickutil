'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowsRightLeftIcon, SparklesIcon, PhotoIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
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
  convertImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult,
  type ConversionOptions
} from '@/lib/imageUtils';

type OutputFormat = 'jpeg' | 'png' | 'webp';

interface FormatConversionResult {
  originalFile: File;
  convertedBlob: Blob;
  originalSize: number;
  convertedSize: number;
  downloadUrl: string;
  processingTime: number;
  originalFormat: string;
  outputFormat: string;
}

export default function ImageFormatConvert() {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Component state - Step-based like PDF convert
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<FormatConversionResult | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs for smooth scrolling
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus on upload section when page loads
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [currentStep]);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!validTypes.includes(file.type)) {
      return 'Supported formats: JPEG, PNG, WebP, GIF';
    }
    
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }
    
    return null;
  };

  // Get current file format
  const getCurrentFormat = (): string => {
    if (!file) return '';
    switch (file.type) {
      case 'image/jpeg':
        return 'JPEG';
      case 'image/png':
        return 'PNG';
      case 'image/webp':
        return 'WebP';
      case 'image/gif':
        return 'GIF';
      default:
        return file.type.replace('image/', '').toUpperCase();
    }
  };

  // Handle file selection
  const handleFileSelect = async (file: File | File[]) => {
    const selectedFile = Array.isArray(file) ? file[0] : file;
    if (!selectedFile) return;
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      alert(validationError);
      return;
    }

    setFile(selectedFile);
    
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      setCurrentStep('configure');
      
      // Focus directly to process button for best user experience
      setTimeout(() => {
        processButtonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
        processButtonRef.current?.focus();
      }, 400);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }
  };

  // Handle format conversion
  const handleConvert = async () => {
    if (!file || !user) return;

    setCurrentStep('processing');
    setIsProcessing(true);
    setProcessingProgress(0);

    const startTime = Date.now();

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      const options: ConversionOptions = {
        format: outputFormat,
        quality,
      };

      const result = await convertImage(file, options);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      const processingTime = Date.now() - startTime;
      const downloadUrl = URL.createObjectURL(result.file);

      const conversionResult: FormatConversionResult = {
        originalFile: file,
        convertedBlob: result.file,
        originalSize: file.size,
        convertedSize: result.file.size,
        downloadUrl,
        processingTime,
        originalFormat: getCurrentFormat(),
        outputFormat: outputFormat.toUpperCase()
      };

      setConversionResult(conversionResult);

      // Track activity
      await ActivityTracker.createActivity(user.uid, {
        type: 'image_convert',
        fileName: file.name,
        originalFileName: file.name,
        fileSize: file.size,
        processedSize: result.file.size,
        status: 'success',
        category: 'Image',
        processingTime,
        downloadUrl
      });

      setCurrentStep('result');
    } catch (error) {
      console.error('Format conversion error:', error);
      alert('An error occurred during conversion. Please try again.');
      setCurrentStep('configure');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!conversionResult) return;

    const a = document.createElement('a');
    a.href = conversionResult.downloadUrl;
    a.download = `converted_${file?.name?.replace(/\.[^/.]+$/, '')}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep('upload');
    setFile(null);
    setConversionResult(null);
    setOutputFormat('jpeg');
    setQuality(0.9);
    setOriginalDimensions(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Scroll to upload section
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

  // Format configurations
  const formatConfigs = {
    jpeg: { 
      icon: '📷', 
      name: 'JPEG', 
      desc: 'Small size, ideal for photos',
      color: 'from-blue-500 to-blue-600'
    },
    png: { 
      icon: '🖼️', 
      name: 'PNG', 
      desc: 'Transparency support, high quality',
      color: 'from-green-500 to-green-600'
    },
    webp: { 
      icon: '🔧', 
      name: 'WebP', 
      desc: 'Modern format, best compression',
      color: 'from-purple-500 to-purple-600'
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      <StructuredData type="tool" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* STEP 1: UPLOAD */}
          <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
            currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="text-center mb-12">
              {/* AI Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4 text-purple-600 mr-2 animate-pulse" />
                Universal Format Support • AI Enhanced
              </div>
              
              {/* Enhanced Title */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  Image Format
                </span>
                <br />
                <span className="text-gray-900">Converter</span>
              </h1>
              
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
                Convert between JPEG, PNG, WebP formats with perfect quality preservation
              </p>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-800 font-medium">Universal Support</span>
                </div>
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
                  <PhotoIcon className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-gray-800 font-medium">Quality Preservation</span>
                </div>
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-800 font-medium">Instant Processing</span>
                </div>
              </div>
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
                    {isDragActive ? 'Drop your image here' : 'Upload Your Image'}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Supports JPEG, PNG, WebP, GIF formats (max 50MB)
                  </p>
                  
                  <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-xl group-hover:shadow-2xl">
                    <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                    Choose File
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* STEP 2: CONFIGURE */}
          {currentStep === 'configure' && file && (
            <div ref={configureRef} className="py-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-full text-sm font-medium mb-4 shadow-lg">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-orange-600 mr-2" />
                  Step 2: Choose Output Format
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Conversion</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Select your desired output format and quality settings
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                {/* Preview Panel (2/5 width) */}
                <div className="lg:col-span-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 h-fit sticky top-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Preview</h3>
                      <button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium"
                      >
                        <PhotoIcon className="w-4 h-4 mr-2" />
                        New Image
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-3">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-32 object-contain rounded-lg"
                        />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">File name:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{file.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium text-gray-900">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium text-gray-900">
                          {originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}px` : 'Calculating...'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current format:</span>
                        <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {getCurrentFormat()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Settings Panel (3/5 width) */}
                <div className="lg:col-span-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 h-fit">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <ArrowsRightLeftIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Format Settings
                    </h3>

                    {/* Format Selection */}
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Choose Output Format</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(formatConfigs).map(([format, config]) => (
                          <button
                            key={format}
                            onClick={() => setOutputFormat(format as OutputFormat)}
                            className={`relative p-3 rounded-xl text-left transition-all duration-300 ${
                              outputFormat === format
                                ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg transform scale-105'
                                : 'bg-white border-2 border-gray-200 hover:border-purple-200 hover:shadow-md'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl mb-2 text-base shadow-lg`}>
                                {config.icon}
                              </div>
                              <h5 className="text-sm font-bold text-gray-900 mb-1">{config.name}</h5>
                              <p className="text-xs text-gray-600">{config.desc}</p>
                            </div>
                            
                            {outputFormat === format && (
                              <div className="absolute top-2 right-2">
                                <CheckCircleIcon className="h-4 w-4 text-purple-600" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality Settings */}
                    {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Quality Settings</h4>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-800">Quality</label>
                              <span className="text-lg font-bold text-purple-600">{Math.round(quality * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={quality}
                              onChange={(e) => setQuality(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${quality * 100}%, #e5e7eb ${quality * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>Smaller file</span>
                              <span>Higher quality</span>
                            </div>
                          </div>
                          
                          {/* Quality Presets */}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 0.6, label: 'Low', desc: '60%' },
                              { value: 0.8, label: 'Medium', desc: '80%' },
                              { value: 1.0, label: 'High', desc: '100%' }
                            ].map(({ value, label, desc }) => (
                              <button
                                key={value}
                                onClick={() => setQuality(value)}
                                className={`p-2 rounded-lg text-center transition-all duration-200 text-sm ${
                                  quality === value 
                                    ? 'bg-purple-600 text-white shadow-lg' 
                                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200'
                                }`}
                              >
                                <div className="font-medium">{label}</div>
                                <div className="text-xs opacity-75">{desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conversion Direction Indicator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {getCurrentFormat()}
                        </span>
                        <ArrowsRightLeftIcon className="h-4 w-4 text-purple-600" />
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                          {formatConfigs[outputFormat].name}
                        </span>
                      </div>
                    </div>

                    {/* Convert Button */}
                    <button
                      ref={processButtonRef}
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:ring-4 focus:ring-purple-300"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Converting...
                        </>
                      ) : (
                        <>
                          🚀 Start Conversion
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 3: PROCESSING */}
          {currentStep === 'processing' && (
            <div className="py-16">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                  Step 3: Converting Format
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Converting Your Image</h2>
                
                {/* Enhanced Processing Animation */}
                <div className="relative mb-12">
                  {/* Multiple Rotating Rings */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute top-2 left-2 w-28 h-28 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                      <div className="absolute top-4 left-4 w-24 h-24 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ArrowsRightLeftIcon className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Processing Progress</span>
                      <span className="text-sm font-medium text-purple-600">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                        style={{ width: `${processingProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Processing Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                      Reading image data...
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      Converting to {formatConfigs[outputFormat].name} format...
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      Optimizing output quality...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 4: RESULT */}
          {currentStep === 'result' && conversionResult && (
            <div className="py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  Step 4: Conversion Complete!
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Converted Image is Ready</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Format conversion completed successfully. Download your new image below.
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  {/* Result Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <h3 className="text-2xl font-bold text-gray-900">Conversion Result</h3>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Download {formatConfigs[outputFormat].name}
                      </button>
                      
                      <button
                        onClick={handleReset}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold flex items-center"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Convert Another
                      </button>
                    </div>
                  </div>
                  
                  {/* Before/After Display */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Original</h4>
                        <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                          {conversionResult.originalFormat}
                        </span>
                      </div>
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Original image"
                            className="w-full h-64 object-contain rounded-xl"
                          />
                        )}
                      </div>
                      <div className="text-center mt-3 text-sm text-gray-600">
                        {formatFileSize(conversionResult.originalSize)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Converted</h4>
                        <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-medium">
                          {conversionResult.outputFormat}
                        </span>
                      </div>
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <img
                          src={conversionResult.downloadUrl}
                          alt="Converted image"
                          className="w-full h-64 object-contain rounded-xl"
                        />
                      </div>
                      <div className="text-center mt-3 text-sm text-purple-600 font-medium">
                        {formatFileSize(conversionResult.convertedSize)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversion Statistics */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                      Conversion Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {conversionResult.originalFormat}
                        </div>
                        <div className="text-sm text-gray-600">From Format</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 mb-1">
                          {conversionResult.outputFormat}
                        </div>
                        <div className="text-sm text-gray-600">To Format</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {conversionResult.processingTime}ms
                        </div>
                        <div className="text-sm text-gray-600">Processing Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 mb-1">
                          {outputFormat === 'jpeg' || outputFormat === 'webp' ? `${Math.round(quality * 100)}%` : '100%'}
                        </div>
                        <div className="text-sm text-gray-600">Quality</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 