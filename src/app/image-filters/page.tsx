'use client';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  PhotoIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  EyeIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  applyFilters, 
  FilterConfig, 
  FilterResult,
  defaultFilterConfig,
  filterPresets,
  applyPreset,
  resetFilters,
  validateFilterConfig
} from '@/lib/imageFilters';
import { useAuth } from '@/contexts/AuthContext';
import { trackImageFilter } from '@/lib/activityTracker';

type Stage = 'upload' | 'processing' | 'result';

export default function ImageFiltersPage() {
  const { user } = useAuth();
  
  // Core state
  const [stage, setStage] = useState<Stage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [filteredImageUrl, setFilteredImageUrl] = useState<string>('');
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(defaultFilterConfig);
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      return 'Desteklenen formatlar: JPEG, PNG, WebP, GIF';
    }
    
    if (file.size > maxSize) {
      return 'Dosya boyutu 10MB\'tan küçük olmalıdır';
    }
    
    return null;
  };

  // File selection handler
  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      alert(error);
      return;
    }

    setSelectedFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setStage('processing');
    setFilterConfig(defaultFilterConfig);
    
    // Set initial filtered image to original
    setFilteredImageUrl(URL.createObjectURL(file));
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

  // Apply filters when config changes
  useEffect(() => {
    if (!selectedFile || stage !== 'processing') return;
    
    const applyFiltersDebounced = async () => {
      setIsProcessing(true);
      
      try {
        const result = await applyFilters(selectedFile, filterConfig);
        setFilterResult(result);
        setFilteredImageUrl(result.filteredImage);
        setStage('result');
      } catch (error) {
        console.error('Filter application failed:', error);
        alert('Filtre uygulanırken hata oluştu');
      } finally {
        setIsProcessing(false);
      }
    };

    const timeoutId = setTimeout(applyFiltersDebounced, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [filterConfig, selectedFile, stage]);

  // Filter control handlers
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
    
    setFilterConfig(validateFilterConfig(newConfig));
  };

  // Preset handlers
  const handlePresetApply = (presetName: keyof typeof filterPresets) => {
    const presetConfig = applyPreset(presetName);
    setFilterConfig(presetConfig);
  };

  const handleResetFilters = () => {
    setFilterConfig(resetFilters());
  };

  // Download handler
  const handleDownload = () => {
    if (!filteredImageUrl || !selectedFile) return;
    
    const link = document.createElement('a');
    link.href = filteredImageUrl;
    link.download = selectedFile.name.replace(/\.[^/.]+$/, '_filtered.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track activity
    if (user && filterResult) {
      trackImageFilter(
        user.uid,
        selectedFile.name,
        selectedFile.size,
        filterResult.appliedFilters.length,
        filterResult.processingTime
      );
    }
  };

  const resetToUpload = () => {
    setStage('upload');
    setSelectedFile(null);
    setOriginalImageUrl('');
    setFilteredImageUrl('');
    setFilterResult(null);
    setFilterConfig(defaultFilterConfig);
    setShowComparison(false);
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
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                   slider:bg-purple-600 slider:rounded-lg"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white mb-4 shadow-lg">
            <AdjustmentsHorizontalIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Professional Image Filters
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Photoshop-level image enhancement with real-time preview
          </p>
        </div>

        {/* Upload Stage */}
        {stage === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50 scale-105'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Dosyayı bırakın' : 'Fotoğraf yükleyin'}
              </h3>
              <p className="text-gray-600 mb-6">
                JPEG, PNG, WebP formatlarını destekliyoruz (max 10MB)
              </p>
              
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg">
                Dosya Seç
              </button>
            </div>
          </div>
        )}

        {/* Processing/Result Stage */}
        {(stage === 'processing' || stage === 'result') && selectedFile && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filter Controls */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Filter Controls
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Reset
                  </button>
                </div>

                {/* Filter Presets */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Quick Presets
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(filterPresets).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetApply(preset as keyof typeof filterPresets)}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-purple-100 rounded-lg transition-colors capitalize font-medium"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Adjustments */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
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
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
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
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
                    <PaintBrushIcon className="w-4 h-4 mr-2" />
                    Artistic Effects
                  </h4>
                  
                  {[
                    { key: 'vintage', label: 'Vintage' },
                    { key: 'sepia', label: 'Sepia' },
                    { key: 'blackWhite', label: 'Black & White' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterConfig[key as keyof FilterConfig] as boolean}
                        onChange={(e) => handleFilterChange(key as keyof FilterConfig, e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Processing Status */}
                {isProcessing && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-3"></div>
                      <span className="text-sm text-purple-700">Applying filters...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                
                {/* Preview Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center ${
                          showComparison 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Compare
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetToUpload}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <PhotoIcon className="w-4 h-4 mr-1" />
                    New Image
                  </button>
                </div>

                {/* Image Display */}
                <div className="relative">
                  {showComparison ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Original</p>
                        <img
                          src={originalImageUrl}
                          alt="Original"
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Filtered</p>
                        <img
                          src={filteredImageUrl}
                          alt="Filtered"
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <img
                        src={filteredImageUrl}
                        alt="Filtered preview"
                        className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  )}
                </div>

                {/* Filter Info */}
                {filterResult && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Applied Filters:</span>
                        <p className="font-medium text-gray-900">
                          {filterResult.appliedFilters.length || 'None'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Processing Time:</span>
                        <p className="font-medium text-gray-900">
                          {filterResult.processingTime}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">File Size:</span>
                        <p className="font-medium text-gray-900">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {filterResult.appliedFilters.length > 0 && (
                      <div className="mt-3">
                        <span className="text-gray-600 text-sm">Active Filters:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {filterResult.appliedFilters.map((filter, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {filter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Download Button */}
                {stage === 'result' && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg flex items-center mx-auto"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      Download Filtered Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 