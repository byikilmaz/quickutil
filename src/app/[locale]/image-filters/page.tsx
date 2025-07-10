'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  PhotoIcon, 
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
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

// Utility function for file size formatting
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ImageFilters() {
  const { user } = useAuth();
  const { canUseFeature } = useQuota();
  const { uploadFile } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Refs
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus on upload area when page loads
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Improved scroll and focus for configure section
    setTimeout(() => {
      configureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    
    setTimeout(() => {
      processButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      processButtonRef.current?.focus();
    }, 800);
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

      setCurrentStep('result');
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

  // Filter slider component
  const FilterSlider = ({ 
    label, 
    value, 
    min, 
    max, 
    step = 1, 
    unit = '', 
    onChange 
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-800">{label}</label>
        <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-lg font-medium">
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );

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
          <Breadcrumb />
          
          {/* STEP 1: UPLOAD */}
          <div ref={uploadRef} className={`py-16 transition-all duration-500 ${
            currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="text-center mb-12">
              {/* AI Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4 text-purple-600 mr-2 animate-pulse" />
                Professional Filters • AI Enhanced
              </div>
              
              {/* Enhanced Title */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  Professional
                </span>
                <br />
                <span className="text-gray-900">Image Filters</span>
              </h1>
              
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
                Apply studio-quality filters to your images with real-time preview and comparison tools
              </p>
              
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
                  <PaintBrushIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-800 font-medium">Professional Filters</span>
                </div>
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
                  <EyeIcon className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-gray-800 font-medium">Real-time Preview</span>
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
                    Supports JPEG, PNG, WebP, GIF formats (max 10MB)
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
            <div ref={configureRef} className="py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-orange-600 mr-2" />
                  Step 2: Configure Filters
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Customize Your Filters</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Adjust settings and preview changes in real-time
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Preview Panel (3/4 width) */}
                <div className="lg:col-span-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    {/* Preview Controls */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Preview</h3>
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-medium ${
                            showComparison 
                              ? 'bg-purple-100 text-purple-700 shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Compare
                        </button>
                        
                        <button
                          onClick={handleReset}
                          className="text-gray-500 hover:text-gray-700 flex items-center font-medium"
                        >
                          <PhotoIcon className="w-4 h-4 mr-2" />
                          New Image
                        </button>
                      </div>
                    </div>

                    {/* Image Display */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                      {showComparison ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Original</p>
                            <img
                              src={originalImageUrl}
                              alt="Original"
                              className="w-full h-auto rounded-xl shadow-lg"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Filtered</p>
                            <img
                              src={filteredImageUrl}
                              alt="Filtered"
                              className="w-full h-auto rounded-xl shadow-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <img
                            src={filteredImageUrl}
                            alt="Filtered preview"
                            className="max-w-full h-auto rounded-xl shadow-lg mx-auto"
                            style={{ maxHeight: '60vh' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Settings Panel (1/4 width) */}
                <div className="lg:col-span-1">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sticky top-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-purple-600" />
                        Controls
                      </h3>
                      <button
                        onClick={handleResetFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center font-medium"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                      </button>
                    </div>

                    {/* Filter Presets */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2 text-purple-600" />
                        Quick Presets
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.keys(filterPresets).map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handlePresetApply(preset as keyof typeof filterPresets)}
                            className="px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-200 capitalize font-medium text-purple-800 border border-purple-200"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Adjustments */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 border-b border-purple-200 pb-2">
                        Basic Adjustments
                      </h4>
                      
                      <FilterSlider
                        label="Brightness"
                        value={filterConfig.brightness}
                        min={-100}
                        max={100}
                        onChange={(value) => handleFilterChange('brightness', value)}
                      />
                      
                      <FilterSlider
                        label="Contrast"
                        value={filterConfig.contrast}
                        min={-100}
                        max={100}
                        onChange={(value) => handleFilterChange('contrast', value)}
                      />
                      
                      <FilterSlider
                        label="Saturation"
                        value={filterConfig.saturation}
                        min={-100}
                        max={100}
                        onChange={(value) => handleFilterChange('saturation', value)}
                      />
                      
                      <FilterSlider
                        label="Hue"
                        value={filterConfig.hue}
                        min={-180}
                        max={180}
                        unit="°"
                        onChange={(value) => handleFilterChange('hue', value)}
                      />
                    </div>

                    {/* Effects */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 border-b border-purple-200 pb-2">
                        Effects
                      </h4>
                      
                      <FilterSlider
                        label="Blur"
                        value={filterConfig.blur}
                        min={0}
                        max={20}
                        step={0.1}
                        unit="px"
                        onChange={(value) => handleFilterChange('blur', value)}
                      />
                      
                      <FilterSlider
                        label="Sharpen"
                        value={filterConfig.sharpen}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(value) => handleFilterChange('sharpen', value)}
                      />
                    </div>

                    {/* Artistic Effects */}
                    <div className="space-y-4 mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 border-b border-purple-200 pb-2 flex items-center">
                        <PaintBrushIcon className="w-4 h-4 mr-2 text-purple-600" />
                        Artistic Effects
                      </h4>
                      
                      {[
                        { key: 'vintage', label: 'Vintage' },
                        { key: 'sepia', label: 'Sepia' },
                        { key: 'blackWhite', label: 'Black & White' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-purple-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={filterConfig[key as keyof FilterConfig] as boolean}
                            onChange={(e) => handleFilterChange(key as keyof FilterConfig, e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Process Button */}
                    <button
                      ref={processButtonRef}
                      onClick={handleProcessFilters}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
                    >
                      🚀 Apply Filters
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
                <div className="inline-flex items-center bg-blue-100 to-cyan-100 border border-blue-200 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
                  <ArrowPathIcon className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                  Step 3: Processing Filters
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Applying Professional Filters</h2>
                
                {/* Enhanced Processing Animation */}
                <div className="relative mb-12">
                  {/* Multiple Rotating Rings */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 border-4 border-purple-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute top-2 left-2 w-28 h-28 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                      <div className="absolute top-4 left-4 w-24 h-24 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <PaintBrushIcon className="h-8 w-8 text-purple-600" />
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
                      Analyzing image properties...
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      Applying filter configurations...
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      Rendering filtered image...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 4: RESULT */}
          {currentStep === 'result' && filterResult && (
            <div className="py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-green-100 to-emerald-100 border border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  Step 4: Filters Applied Successfully!
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Filtered Image is Ready</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Professional filters have been applied. Preview and download your enhanced image.
                </p>
              </div>
              
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  {/* Result Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-2xl font-bold text-gray-900">Final Result</h3>
                      
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-medium ${
                          showComparison 
                            ? 'bg-purple-100 text-purple-700 shadow-lg' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Download Filtered Image
                      </button>
                      
                      <button
                        onClick={handleReset}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold flex items-center"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Process Another
                      </button>
                    </div>
                  </div>
                  
                  {/* Before/After Comparison or Single Result */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
                    {showComparison ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Original</h4>
                            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                              {formatFileSize(filterResult.originalSize)}
                            </span>
                          </div>
                          <img
                            src={originalImageUrl}
                            alt="Original image"
                            className="w-full h-auto rounded-xl shadow-lg"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Filtered</h4>
                            <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-medium">
                              {formatFileSize(filterResult.filteredSize)}
                            </span>
                          </div>
                          <img
                            src={filterResult.downloadUrl}
                            alt="Filtered image"
                            className="w-full h-auto rounded-xl shadow-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img
                          src={filterResult.downloadUrl}
                          alt="Filtered result"
                          className="max-w-full h-auto rounded-xl shadow-lg mx-auto"
                          style={{ maxHeight: '70vh' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Filter Statistics */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                      Filter Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {filterResult.appliedFilters.length}
                        </div>
                        <div className="text-sm text-gray-600">Applied Filters</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 mb-1">
                          {filterResult.processingTime}ms
                        </div>
                        <div className="text-sm text-gray-600">Processing Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {formatFileSize(filterResult.originalSize)}
                        </div>
                        <div className="text-sm text-gray-600">Original Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 mb-1">
                          {formatFileSize(filterResult.filteredSize)}
                        </div>
                        <div className="text-sm text-gray-600">Final Size</div>
                      </div>
                    </div>
                    
                    {filterResult.appliedFilters.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-purple-200">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Active Filters:</h5>
                        <div className="flex flex-wrap gap-2">
                          {filterResult.appliedFilters.map((filter, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium border border-purple-200"
                            >
                              {filter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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