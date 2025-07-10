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
import { 
  applyFilters, 
  FilterConfig, 
  FilterResult,
  defaultFilterConfig,
  filterPresets,
  applyPreset,
  resetFilters
} from '@/lib/imageFilters';

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

export default function ImageFiltersClient({ locale }: ImageFiltersClientProps) {
  console.log('Image Filters Client Component loaded with locale:', locale);
  
  const router = useRouter();
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get translations
  const translations = getTranslations(locale);
  
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

  // Refs for auto-focus
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

  // Filter handlers
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
  };

  const handlePresetApply = (presetName: keyof typeof filterPresets) => {
    const presetConfig = applyPreset(presetName);
    setFilterConfig(presetConfig);
  };

  const handleResetFilters = () => {
    setFilterConfig(resetFilters());
  };

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
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <EyeIcon className="h-6 w-6 text-purple-600 mr-3" />
                      {getText('imageFilters.configure.preview', 'Preview')}
                    </h3>
                    
                    {/* Image Preview */}
                    <div className="relative">
                      <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video">
                        <img 
                          src={originalImageUrl} 
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Comparison Toggle */}
                      {showComparison && (
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm"
                          >
                            Split View
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="order-1 lg:order-2">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <PaintBrushIcon className="h-6 w-6 text-purple-600 mr-3" />
                      {getText('imageFilters.configure.adjustments', 'Adjustments')}
                    </h3>
                    
                    {/* Basic Adjustments */}
                    <div className="space-y-6 mb-8">
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
                    <div className="mb-8">
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
                    <div className="mb-8">
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

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={handleResetFilters}
                        className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                      >
                        {getText('imageFilters.configure.resetFilters', 'Reset Filters')}
                      </button>
                      <button
                        onClick={handleProcessFilters}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isProcessing ? 'Processing...' : getText('imageFilters.configure.applyFilters', 'Apply Filters')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 3: PROCESSING */}
          {currentStep === 'processing' && (
            <div ref={processingRef} className="py-16 min-h-screen flex items-center justify-center animate-fade-in">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg backdrop-blur-sm">
                  <ArrowPathIcon className="h-4 w-4 text-purple-600 mr-2 animate-spin" />
                  {getText('imageFilters.processing.step', 'Step 3: Applying Filters')}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {getText('imageFilters.processing.title', 'AI Processing Your Image')}
                </h2>
                <p className="text-xl text-gray-700 mb-12">
                  {getText('imageFilters.processing.description', 'Applying studio-quality filters...')}
                </p>
                
                {/* Enhanced Loading Animation */}
                <div className="relative mb-12">
                  {/* Orbital Rings */}
                  <div className="relative w-40 h-40 mx-auto">
                    <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 border-4 border-pink-300 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                    <div className="absolute inset-4 border-4 border-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    
                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PaintBrushIcon className="h-16 w-16 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Floating Sparkles */}
                  <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-6 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-4 -left-6 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute -bottom-2 -right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                
                <p className="text-lg text-gray-600">
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